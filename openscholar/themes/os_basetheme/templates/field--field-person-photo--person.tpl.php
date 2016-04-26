<div class="<?php print $classes; ?>"<?php print $attributes; ?>>
	EAM
  <?php if (!$label_hidden): ?>
    <div class="field-label"<?php print $title_attributes; ?>><?php print $label ?>:&nbsp;</div>
  <?php endif; ?>
  <div class="field-items"<?php print $content_attributes; ?>>
      <?php foreach ($items as $delta => $item): ?>

			<?php # error_log("EAM trace \$item = " . var_export($item)); ?>
			<?php # error_log("EAM trace \$item_attributes = " . var_export($item_attributes)); ?>
			<?php # error_log("EAM trace \$delta = " . var_export($delta)); ?>

			<?php # echo("EAM trace \$item = " . var_export($item)); ?>
			<?php # echo("EAM trace \$item_attributes = " . var_export($item_attributes)); ?>
			<?php # echo("EAM trace \$delta = " . var_export($delta)); ?>

      <div class="field-item <?php print $delta % 2 ? 'odd' : 'even'; ?>"<?php print $item_attributes[$delta]; ?>>
      <figure>
        <?php print render($item); ?>
        <?php if(!empty($item['#item']['os_file_description'][LANGUAGE_NONE][0]['value'])): ?>
         <figcaption>
           <?php print $item['#item']['os_file_description'][LANGUAGE_NONE][0]['value'];?>
         </figcaption>
        <?php endif;?>
      </figure>
      </div>
      <?php endforeach; ?>
			<a href="">Read More</a>
  </div>
</div>
