<?php $this->load->view('_shared/file/iframe_header'); ?>

<div class="upload_rename">
	<h2><?= lang('upload_rename') ?></h2>
	<?= form_open('C=content_files'.AMP.'M=update_file', '', array('file_id' => $file['file_id'], 'file_json' => $file_json, 'file_ext' => $file_ext, 'directory_id' => $file['upload_location_id'])) ?>
	<p><input type="text" name="new_file_name" value="<?= $file_name ?>" /></p>
	<p><input type="submit" name="submit" value="Submit" /></p>
	<?= form_close() ?>
</div> <!-- .upload_rename -->

<?php $this->load->view('_shared/file/iframe_footer') ?>