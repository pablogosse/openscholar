<div class="<?php print $classes; ?>"<?php print $attributes; ?>>
  <?php if (!$label_hidden): ?>
    <div class="field-label"<?php print $title_attributes; ?>><?php print $label ?>:&nbsp;</div>
  <?php endif; ?>
  <div class="field-items"<?php print $content_attributes; ?>>
      <?php foreach ($items as $delta => $item): ?>
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
  </div>
</div>



  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js"></script>
  <script type="text/javascript">
    console.log("Hi EAM 1095");

    jQuery(document).ready(function() {
        console.log("Hi EAM 1098");

        var picBios = jQuery(".pic-bio");

        // How to remove nested img elements?
        var figures = jQuery("figure a");

        var i = 0;
        jQuery.each(figures, function(a,b) {
            console.log(a);
            console.log(b['href']);

            var myHref = b['href'];
            var newHTML = picBios[i].innerHTML + "<a href='" + myHref + "'>Read More</a>";

            jQuery(picBios[i]).html(newHTML);

            console.log(newHTML);

            i++;
        });
      
    });

  </script>

