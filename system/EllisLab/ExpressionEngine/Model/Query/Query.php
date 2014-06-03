<?php namespace EllisLab\ExpressionEngine\Model\Query;

use EllisLab\ExpressionEngine\Core\AliasService;
use EllisLab\ExpressionEngine\Model\Collection;
use EllisLab\ExpressionEngine\Model\ModelFactory;
use EllisLab\ExpressionEngine\Model\Relationship\RelationshipMeta;
use EllisLab\ExpressionEngine\Model\Query\QueryTreeNode;

class Query {

	private $factory;
	private $alias_service;

	private $db;
	private $model_name;

	private $limit = '18446744073709551615'; // 2^64
	private $offset = 0;

	private $filters = array();
	private $selected = array();
	private $subqueries = array();

	private $aliases = array();
	private $tables = array();

	/**
	 * @var	QueryTreeNode $root	The root of this query's tree of model
	 * 			relationships.  The model we initiated the query against.
	 */
	private $root = NULL;
	private $model_index = array();

	public function __construct(ModelFactory $factory, AliasService $alias_service, $model_name)
	{
		$this->factory = $factory;
		$this->alias_service = $alias_service;

		if (function_exists('ee'))
		{
			$this->setConnection(ee()->db); // TODO reset?
		}

		$this->createRoot($model_name);
	}

	protected function createRoot($model_name)
	{
		$this->model_name = $model_name;
		$this->root = new QueryTreeNode($model_name);
		$this->root->meta = NULL;

		$this->selectFields($this->root);

		$model_class = $this->alias_service->getRegisteredClass($model_name);
		$gateway_names = $model_class::getMetaData('gateway_names');

		$primary_gateway_name = array_shift($gateway_names);
		$primary_gateway_class = $this->alias_service->getRegisteredClass($primary_gateway_name);

		$primary_tablename = $primary_gateway_class::getMetaData('table_name');
		$primary_aliased_tablename =  $primary_tablename . '_' . $this->root->getId();
		$this->db->from($primary_tablename . ' AS ' . $primary_aliased_tablename);

		foreach($gateway_names as $gateway_name)
		{
			$gateway_class = $this->alias_service->getRegisteredClass($gateway_name);
			$tablename = $gateway_class::getMetaData('table_name');
			$aliased_tablename = $tablename . '_' . $this->root->getId();
			$this->db->join(
				$tablename . ' AS ' . $aliased_tablename,
				$primary_aliased_tablename.
				'.' .
				$primary_gateway_class::getMetaData('primary_key') .
				' = ' .
				$aliased_tablename .
				'.' .
				$gateway_class::getMetaData('primary_key')
			);

		}
	}

	/**
	 * Get the node for a given relationship name from the relationship tree
	 */
	protected function getNodeForRelationship($relationship_name)
	{
		$relationship_name = $this->getAlias($relationship_name);
		foreach($this->root->getBreadthFirstIterator() as $node)
		{
			if ($node->getName() == $relationship_name)
			{
				return $node;
			}
		}

		return NULL;
	}

	/**
	 * Take Relationship.property and translate it to table.property
	 */
	protected function translateProperty($relationship_property)
	{
		$relationship_name = strtok($relationship_property, '.');
		$property = strtok('.');
		$node = $this->getNodeForRelationship($relationship_name);

		if ($node === NULL && $property === FALSE)
		{
			$property = $relationship_name;
			$relationship_name = $this->root->getName();
			$node = $this->root;
		}

		if ( ! $node->isRoot())
		{
			$model_class = $node->meta->to_model_class;
		}
		else
		{
			$model_class = $this->alias_service->getRegisteredClass($relationship_name);
		}

		if ($property === FALSE)
		{
			$property = $model_class::getMetaData('primary_key');
		}

		$gateway_names = $model_class::getMetaData('gateway_names');
		foreach($gateway_names as $gateway_name)
		{
			$gateway_class = $this->alias_service->getRegisteredClass($gateway_name);
			if (array_key_exists($property, $gateway_class::getMetaData('field_list')))
			{
				$table = $gateway_class::getMetaData('table_name');
				break;
			}
		}
		if ( ! isset($table))
		{
			throw new \Exception('Property ' . $property . ' was not found on model ' . $model_class);
		}

		$result = $table . '_' . $node->getId() . '.' . $property;
		return $result;
	}

	/**
	 * Apply a filter
	 *
	 * @param String $key		Relationship.columnname to filter on
	 * @param String $operator	Comparison to perform [==, !=, <, >, <=, >=, IN]
	 * @param Mixed  $value		Value to compare to
	 * @return Query $this
	 *
	 * The third parameter is optional. If it is not given, the == operator is
	 * assumed and the second parameter becomes the value.
	 */
	public function filter($property, $operator, $value = NULL)
	{
		// We'll use this to mask the application.  We'll need it
		// when we do subquerying.
		$this->applyFilter($property, $operator, $value);

		return $this;
	}

	public function or_filter($property, $operator, $value = NULL)
	{
		$this->applyFilter($property, $operator, $value, TRUE);
		return $this;
	}

	protected function applyFilter($relationship_property, $operator, $value, $or = TRUE)
	{
		if ( ! isset($value))
		{
			$value = $operator;
			$operator = '';
		}

		if ($operator == '==')
		{
			$operator = ''; // CI's query builder defaults to equals
		}

		$table_property = $this->translateProperty($relationship_property);

		if ($or)
		{
			if (strtolower($operator) == 'in')
			{
				$this->db->or_where_in($table_property, (array) $value);
			}
			else
			{
				$this->db->or_where($table_property.' '.$operator, $value);
			}
		}

		if (strtolower($operator) == 'in')
		{
			$this->db->where_in($table_property, (array) $value);
		}
		else
		{
			$this->db->where($table_property.' '.$operator, $value);
		}
	}


	public function order($property, $direction = '')
	{
		$this->applyOrder($property, $direction);
		return $this;
	}

	protected function applyOrder($relationship_property, $direction = '')
	{
		$table_property = $this->translateProperty($relationship_property);
		$this->db->order_by($table_property, $direction);
	}

	/**
	 * Eager load a relationship
	 *
	 * @param Mixed Any combination of either a direct relationship name or
	 * an array of (parent > child).
	 *
	 * For example:
	 *
	 * get('ChannelEntry')
	 * 	->with(
	 * 		'Channel',
	 * 		array(
	 * 			'Member' => array(
	 * 				array('MemberGroup'=>'Member'),
	 * 				'MemberCustomFields')),
	 * 		array('Categories' => 'CategoryGroup'))
	 * OR
	 *
	 * get('ChannelEntry')
	 * 	->with(
	 * 		array(
	 * 			'to' => 'Channel',
	 * 			'method' => 'join'
	 * 		)
	 * 		array(
	 * 			'to' => 'Member',
	 * 			'method' => 'subquery',
	 * 			'with'  => array(
	 * 				'to' => array('MemberGroup', 'MemberCustomFields')
	 * 				'method' => 'join'),
	 * 		array('Categories' => array(
	 * 			'CategoryCustomFields',
	 * 			'CategoryGroup'))
	 */
	public function with()
	{
		$relationships = func_get_args();

		foreach ($relationships as $relationship)
		{
			$this->buildRelationshipTree($this->root, $relationship);
		}

		foreach($this->root->getBreadthFirstIterator() as $node)
		{
			if ($node->isRoot() || $this->hasParentSubquery($node))
			{
				continue;
			}
			$this->buildRelationship($node);
		}

		return $this;
	}

	/**
	 *
	 */
	private function buildRelationshipTree(QueryTreeNode $parent, $relationship)
	{
		// An array could be one or two things:
		// 	- We're specifying meta data for this node of the tree
		// 		where meta data could be things like join vs subquery
		// 	- The relationship tree has another level below this one
		if (is_array($relationship))
		{
			// If the 'to' key exists, then we're specifying meta data, but
			// we could still have another level below this one in the
			// relationship tree.  So we need to check for a 'with' key.
			if ( isset($relationship['to']))
			{
				// Build the relationship, pass the meta data through.
				$to = $relationship['to'];
				unset($relationship['to']);
				if ( isset ($relationship['with']))
				{
					$with = $relationship['with'];
					unset($relationship['with']);
				}

				$parent->add($this->createNode($parent, $to, $relationship));

				// If we have a with key, then recurse.
				if ( isset ($with))
				{
					$this->buildRelationshipTree($to_node, $with);
				}
			}
			// If we don't have a 'to' key, then each element of the
			// array is just a model from => to.
			else
			{
				foreach ($relationship as $from => $to)
				{
					// If the key is numeric, then we have the case of
					// 	'Member' => array(
					// 		'MemberCustomField',
					// 		'MemberGroup
					// 	)
					//
					// 	Where a related model needs multiple child models
					// 	eager loaded.  In that case, the "from" model is
					// 	not the key (which is numeric), but rather the
					// 	from model we were called with last time.  We'll
					// 	recurse and pass the from model with each to
					// 	model.
					if (is_numeric($from))
					{
						$parent->add($this->createNode($parent, $to));
					}
					// Otherwise, if the key is not numeric, then
					// we have the case of
					// 	'Member' => array(
					// 		'MemberGroup' => array('Member')
					// 	)
					// 	We'll need to build the 'Member' => 'MemberGroup'
					// 	relationship and then recurse into the
					// 	'MemberGroup' => 'Member' relationship.
					else
					{
						// 'Member' => 'MemberGroup'
						$from_node = $this->createNode($parent, $from);
						$parent->add($from_node);
						// 'MemberGroup' => array('Member')
						// where $to might be an array and could result
						// in more recursing.  The call will deal
						// with that.
						$this->buildRelationshipTree($from_node, $to);
					}
				}
			}
			// If we had an array, then we definitely recursed, and the
			// recursive calls will eventually boil down to a single from
			// and to.  The call with a non-array to will handle the building
			// and that is not this call.
			return;
		}

		// If there's no more tree walking to do, then we have bubbled
		// down to a single edge in the tree (From_Model -> To_Model), build it.
		$parent->add($this->createNode($parent, $relationship));
	}

	/**
	 * Create Node in the Relationship Tree
	 *
	 * Create a node in our relationship tree with the given parent.  In our
	 * relationship tree, nodes are actually the edges in the Relationship graph.
	 * They are named for the relationship, the name of the method used to
	 * retrieve the relationship on the "from" object, and carry a "from" and
	 * "to".
	 *
	 * @param	QueryTreeNode	$parent	The parent node to this one, represents the edge
	 * 		leading to the attached vertex from which this node (representing an edge)
	 * 		spawns.
	 */
	private function createNode(QueryTreeNode $parent, $relationship_name, array $meta=array())
	{
		if (strpos($relationship_name, 'AS'))
		{
			list($relationship_name, $alias) = explode('AS', $relationship_name);
			$relationship_name = trim($relationship_name);
			$alias = trim($alias);
			$this->setAlias($alias, $relationship_name);
		}

		$node = new QueryTreeNode($relationship_name);

		if ($parent->isRoot())
		{
			$from_model_name = $parent->getName();
		}
		else
		{
			$from_model_name = $parent->meta->to_model_name;
		}

		$from_model = $this->factory->make($from_model_name);

		$relationship_method = 'get' . $relationship_name;

		if ( ! method_exists($from_model, $relationship_method))
		{
			throw new \Exception('Undefined relationship from ' . $from_model_name . ' to ' . $relationship_name . '.  Could not find ' . $relationship_method . '().');
		}

		$relationship_meta = $from_model->$relationship_method();
		$relationship_meta->override($meta);
		$relationship_meta->from_model_name = $from_model_name;

		$node->meta = $relationship_meta;
		return $node;
	}

	/**
	 *
	 */
	private function buildRelationship(QueryTreeNode $node)
	{
		if ($node->meta->method == RelationshipMeta::METHOD_JOIN)
		{
			$this->buildJoinRelationship($node);
		}
		elseif ($node->meta->method == RelationshipMeta::METHOD_SUBQUERY)
		{
			$this->buildSubqueryRelationship($node);
		}
	}

	/**
	 *
	 */
	private function buildJoinRelationship(QueryTreeNode $node)
	{
		$relationship_meta = $node->meta;
		$this->selectFields($node);

		$from_id = $node->getParent()->getId();

		switch ($relationship_meta->type)
		{
			case RelationshipMeta::TYPE_ONE_TO_ONE:
			case RelationshipMeta::TYPE_ONE_TO_MANY:
			case RelationshipMeta::TYPE_MANY_TO_ONE:
				$this->db->join($relationship_meta->to_table . ' AS ' . $relationship_meta->to_table . '_' . $node->getId(),
					$relationship_meta->from_table . '_' . $from_id . '.' . $relationship_meta->from_key .
					'=' .
					$relationship_meta->to_table . '_' . $node->getId() . '.' . $relationship_meta->to_key,
					'LEFT OUTER');
				break;

			case RelationshipMeta::TYPE_MANY_TO_MANY:
				$this->db->join($relationship_meta->pivot_table . ' AS ' . $relationship_meta->pivot_table . '_' . $node->getId(),
					$relationship_meta->from_table . '_' . $from_id . '.' . $relationship_meta->from_key .
					'=' .
					$relationship_meta->pivot_table . '_' . $node->getId() . '.' . $relationship_meta->pivot_from_key,
					'LEFT OUTER');
				$this->db->join($relationship_meta->to_table . ' AS ' . $relationship_meta->to_table . '_' . $node->getId(),
					$relationship_meta->pivot_table . '_' . $node->getId() . '.' . $relationship_meta->pivot_to_key .
					'=' .
					$relationship_meta->to_table . '_' . $node->getId() . '.' . $relationship_meta->to_key,
					'LEFT OUTER');
				break;
		}

		foreach ($relationship_meta->joined_tables as $joined_key => $joined_table)
		{
			$this->db->join($joined_table . ' AS ' . $joined_table . '_' . $node->getId(),
				$relationship_meta->to_table . '_' . $node->getId() . '.' . $relationship_meta->join_key .
				'=' .
				$joined_table . '_' . $node->getId() . '.' . $joined_key,
				'LEFT OUTER');
		}

	}

	private function hasParentSubquery(QueryTreeNode $node)
	{
		for($n = $node; ! $n->isRoot(); $n = $n->getParent())
		{
			// If we encounter a subquery parent with no parent, then that subquery
			// node is the root and we're in a subquery!
			if ($n->meta->method == RelationshipMeta::METHOD_SUBQUERY
				&& $n->getParent() !== NULL)
			{
				return TRUE;
			}
		}

		return FALSE;
	}

	private function buildSubqueryRelationship(QueryTreeNode $node)
	{
		$subquery = new static($node->meta->to_model_name);
		$subquery->withSubtree($node->getSubtree());

		$path = $node->getPathString();
		$this->subqueries[$path] = $subquery;
	}

	private function withSubtree(QueryTreeNode $root)
	{
		foreach($root->getChildren() as $node)
		{
			$this->root->add($node);
		}
	}


	public function debug_query()
	{
		$query = $this->db->_compile_select();
		return $query;
	}

	/**
	 * Run the query, hydrate the models, and reassemble the relationships
	 *
	 * @return Collection
	 */
	public function all()
	{
		// Run the query
		$result_array = $this->db->get()->result_array();

		return new Collection($this->parseDatabaseResult($result_array));
	}

	/**
	 * Need to take aliased results in the form of joined query rows and
	 * build the model tree out of them.
	 */
	protected function parseDatabaseResult($database_result)
	{
		// Each row holds field=>value data for the full joined query's tree.
		// In order to take this flat row data and reconstruct it into a tree,
		// the field names of each field=>value pair have been aliased with the
		// path to the correct node (in ids), and the model to which the field
		// belongs.  Each field name looks like this: path__model__fieldName
		//
		// Where path, model and fieldName may have single underscores in them.
		// The path is a series of underscore separated integers corresponding
		// to the unique ids of nodes in this query's relationship tree.  The
		// tree might look something like this:
		//
		// 				ChannelEntry(1)
		// 			/			|			\
		// 	Channel (2)		Author (3)		Categories (4)
		//						|				|
		// 					MemberGroup (5)	CategoryGroup (6)
		//
		// 	So a field in the CategoryGroup model would be aliased like so:
		//
		// 	1_4_6__CategoryGroup__group_id
		//
		// 	A field in the Author relationship (Member model) might be
		// 	aliased:
		//
		// 	1_3__Member__member_id
		//
		// 	This will allow us to create the models we've pulled and
		// 	correctly reconstruct the tree.
		$results = array();
		$result_index = array();

		foreach ($database_result as $row)
		{
			$row_data = array();

			foreach ($row as $name => $value)
			{
				list($path, $relationship_name, $model_name, $field_name) = explode('__', $name);

				if ( ! isset($row_data[$path]))
				{
					$row_data[$path] = array(
						'__model_name' => $model_name,
						'__relationship_name' => $relationship_name
					);
				}

				$row_data[$path][$field_name] = $value;
			}

			//echo 'Processing Row: <pre>'; var_dump($row_data); //echo '</pre>';

			foreach ($row_data as $path => $model_data)
			{
				// If this is an empty model that happened to have been grabbed due to the join,
				// move on and don't do anything.
				$model_class = $this->alias_service->getRegisteredClass($model_data['__model_name']);
				$primary_key_name = $model_class::getMetaData('primary_key');

				if ($row_data[$path][$primary_key_name] === NULL)
				{
					unset($row_data[$path]);
					continue;
				}

				$model_name =  $model_data['__model_name'];
				$relationship_name = $model_data['__relationship_name'];

				$model_class = $this->alias_service->getRegisteredClass($model_name);
				$primary_key_name = $model_class::getMetaData('primary_key');
				$primary_key = $model_data[$primary_key_name];

				if (isset($this->model_index[$model_name][$primary_key]))
				{
					$model = $this->model_index[$model_name][$primary_key];
				}
				else
				{
					$model = $this->createResultModel($model_data);
				}

				if ($this->isRootModel($path))
				{
					if ( ! isset($result_index[$primary_key]))
					{
						$results[] = $model;
						$result_index[$primary_key] = TRUE;
					}

					continue;
				}

				$parent_model = $this->findModelParent($row_data, $path);

				if ($parent_model === NULL)
				{
					throw new \Exception('Missing model parent!');
				}

				// Reverse the relationship so we can fill in both sides
				// TODO we should not do this if $parent_model is really a child!
				$reverse = $parent_model->getRelationshipInfo($relationship_name)->getInverseOn($model);

				if ($reverse)
				{
					if ( ! $model->hasRelated($reverse->name))
					{
						$model->addRelated($reverse->name, $parent_model);
					}
				}

				if ( ! $parent_model->hasRelated($relationship_name, $primary_key))
				{
					$parent_model->addRelated($relationship_name, $model);
				}
			}
		}

		return $results;
	}

	/**
	 * Determine if this is a Root Model
	 *
	 * Is this a root model?  One of the ones we're get()ing.
	 *
	 * @param 	string	$path	The path to the model's node in the
	 * 		relationship tree.
	 *
	 * @return	boolean	TRUE if this is a root model, FALSE otherwise.
	 */
	protected function isRootModel($path)
	{
		// If it's an integer, then it's a
		// root node, because it doesn't have
		// any children.
		return is_int($path);
	}

	/**
	 *
	 */
	protected function createResultModel($model_data)
	{
		$model_name = $model_data['__model_name'];

		$model = $this->factory->make($model_name, $model_data, FALSE);

		$primary_key_name = $model::getMetaData('primary_key');
		$primary_key = $model_data[$primary_key_name];

		if ( ! isset ($this->model_index[$model_name]))
		{
			$this->model_index[$model_name] = array();
		}

		$this->model_index[$model_name][$primary_key] = $model;

		return $this->model_index[$model_name][$primary_key];
	}

	protected function findModelParent($path_data, $child_path)
	{
		$path = substr($child_path, 0, strrpos($child_path, '_'));

		$model_data = $path_data[$path];

		$model_name = $model_data['__model_name'];
		$model_class = $this->alias_service->getRegisteredClass($model_name);

		$primary_key_name = $model_class::getMetaData('primary_key');
		$primary_key = $model_data[$primary_key_name];

		if (isset($this->model_index[$model_name][$primary_key]))
		{
			return $this->model_index[$model_name][$primary_key];
		}

		throw new \Exception('Model parent has not been created yet for child path "' . $child_path . '" and model "' . $model_name . '"');
	}

	/**
	 * Run the query, hydrate the models, and reassemble the relationships, but
	 * limit it to just one.
	 *
	 * @return Model Instance
	 */
	public function first()
	{
		$this->limit(1);
		$collection = $this->all();

		if (count($collection))
		{
			return $collection->first();
		}

		return NULL;
	}

	/**
	 * Count the number of objects that would be returned by this query if it
	 * was run right now.
	 *
	 * @return int Row count
	 */
	public function count()
	{
		return $this->db->count_all_results();
	}

	/**
	 * Limit the result set.
	 *
	 * @param int Number of elements to limit to
	 * @return $this
	 */
	public function limit($n = NULL)
	{
		$this->db->limit($n, $this->offset);
		$this->limit = $n;
		return $this;
	}

	/**
	 * Offset the result set.
	 *
	 * @param int Number of elements to offset to
	 * @return $this
	 */
	public function offset($n)
	{
		$this->db->limit($this->limit, $n);
		$this->offset = $n;
		return $this;
	}

	/**
	 * Add selects for all fields to the query.
	 *
	 * @param String $model Model name to select.
	 */
	protected function selectFields(QueryTreeNode $node)
	{
		if ($node->isRoot())
		{
			$relationship_name = 'root';
			$model_name = $node->getName();
		}
		else
		{
			$relationship_name = $node->meta->relationship_name;
			$model_name = $node->meta->to_model_name;
		}

		$model_class_name = $this->alias_service->getRegisteredClass($model_name);
		foreach ($model_class_name::getMetaData('gateway_names') as $gateway_name)
		{
			$gateway_class_name = $this->alias_service->getRegisteredClass($gateway_name);

			$table = $gateway_class_name::getMetaData('table_name');
			$properties = $gateway_class_name::getMetaData('field_list');

			foreach ($properties as $property=>$default_value)
			{
				$this->db->select($table . '_' . $node->getId() . '.' . $property . ' AS ' . $node->getPathString() . '__' . $relationship_name . '__' . $model_name . '__' . $property);
			}
		}
	}

	protected function setAlias($alias, $relationship_name)
	{
		$this->aliases[$alias] = $relationship_name;
		return $this;
	}

	protected function getAlias($aliased)
	{
		if ( isset ($this->aliases[$aliased]))
		{
			return $this->aliases[$aliased];
		}
		return $aliased;
	}

	public function setConnection($db)
	{
		$this->db = $db;
	}

}
