(function () {
	var rootPath;
    var restPath;
    var vsite;
    var notify_settings;
    var user_data;
    var paths;

    angular.module('UserPanel', ['AdminPanel'])
    .config(function (){
       
       rootPath = Drupal.settings.paths.adminPanelModuleRoot;
       restPath = Drupal.settings.paths.api;
       
       if(typeof(Drupal.settings.spaces) == 'undefined') {
    	 vsite = false;   
       } else {	   
         vsite = Drupal.settings.spaces.id;
       }
       
       user_data = Drupal.settings.user_panel.user;
       paths = Drupal.settings.paths;
       notify_settings = Drupal.settings.os_notifications;
    }).controller("UserMenuController",['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    
      $scope.user = user_data;
      $scope.vsite = { id: vsite };
      $scope.paths = paths;
      $scope.close_others = function(id){
    	//Protect the current link
    	if(!jQuery("#rightMenuSlide .click-processing").length) {
          jQuery("#rightMenuSlide [data-id='"+id+"']").addClass('click-processing');
    	}
        
        $timeout(function() {
          jQuery('#rightMenuSlide .menu_modal_open').not("[data-id='"+id+"']").not('.click-processing').click();
          $timeout(function() {
            jQuery("#rightMenuSlide .click-processing").removeClass('click-processing');
          });
      	});
      };
     
    }]).controller("UserSitesController",['$scope', '$http', function ($scope, $http) {
        $scope.baseUrl = Drupal.settings.basePath;
        $scope.purlBaseDomain = Drupal.settings.admin_panel.purl_base_domain + Drupal.settings.basePath;
        
        var url = paths.api + '/users/' + user_data.uid;
        $http({method: 'get', url: url}).
          then(function(response) {
            if(typeof(response.data.data[0].og_user_node) == 'undefined') {
              $scope.site_data = [];
            } else {
              $scope.site_data = response.data.data[0].og_user_node;
            }

            $scope.create_access = response.data.data[0].create_access;
          });
          $scope.pageSize = 7;
          $scope.numberOfPages=function(data){
            return Math.ceil(data.length/$scope.pageSize);                
          }
        
      }]).directive('rightMenu', function() {
      return {
       templateUrl: rootPath+'/templates/user_menu.html?vers='+Drupal.settings.version.userPanel,
       controller: 'UserMenuController',
     };
    }).directive('addDestination', function() {
      //Add the destination to a URL
	  return {
	    link: function(scope, element, attrs) {
		  var url = (typeof(attrs.href) == 'undefined') ? attrs.ngHref : attrs.href;
	      element.attr('href', url + ((url.indexOf('?') == -1) ? '?' : '&') + 'destination=' + encodeURIComponent(location.href));
  	    },
	  }
    }).directive('loadMySites', function() {
    	 
        return {
            templateUrl: rootPath+'/templates/user_sites.html?vers='+Drupal.settings.version.userPanel,
            controller: 'UserSitesController',
          };
       
    }).directive('notificationCheck', function() {
      //check for google and hopscotch
      if (typeof google == 'undefined' || typeof hopscotch == 'undefined') {
        return {};
	  }
      
      //Go to feed and check for notifications.
  	  return {
  	    link: function(scope, element, attrs) {
  		  count_element = angular.element('<span class="slate alert" ng-alert=></span>');
  		  // @TODO: Add support for multiple feeds.
	      var feed = new google.feeds.Feed(notify_settings.url);
	      var link = element.find('a')[0];
	      
	      feed.setNumEntries(notify_settings.max);
	      feed.load(function (result) {
	        if (result.error) {
            element.hide();
	          return;
	        }

          var items = [],
            oldItems = [];
	          
	        for (var i = 0; i < result.feed.entries.length; i++) {
	          var num_remaining = (result.feed.entries.length - i);
	          var entry = result.feed.entries[i];
              var item = osTour.notifications_item(entry, num_remaining, count_element, link);
	          if (osTour.notifications_is_new(entry)) {
	            items.push(item);
	          }
              else {
                oldItems.push(item);
              }
	        }

          /* Add a permanent "stop" node to the end of the list. */
          var lastEntryContent = "There are no new announcements. Click here to view the <a href=\"http://hwp.harvard.edu/os-alerts/announcement\" target=\"_blank\">archive</a>.";
          var lastEntry = {
               author: "scholar",
               categories: [],
               content: lastEntryContent,
               contentSnippet: lastEntryContent,
               publisheddDate: "Fri, 1 Jan 1971 00:00:00 -0800",
               title: "No new announcements."
          };
          var lastItem = osTour.notifications_item(lastEntry, num_remaining, count_element, link, true);
          var trueCount = items.length;
          items.push(lastItem);

          var tour = {};
          // If there are new items
          if (items.length) {
            // Sets up the DOM elements.
            if (trueCount) {
              element.append(count_element);
              osTour.notifications_count(count_element, trueCount);
            }
              //$('#os-tour-notifications-menu-link').slideDown('slow');

            // Sets up the tour object with the loaded feed item steps.
            tour = {
              showPrevButton: true,
              scrollTopMargin: 100,
              id: "os-tour-notifications",
              steps: items,
              onEnd: function() {
                osTour.notifications_count(count_element, -1);
                osTour.notifications_read_update();
              }
            };
          }
          else {
            oldItems.reverse();

            tour = {
              showPrevButton: true,
              scrollTopMargin: 100,
              id: "os-tour-notifications",
              steps: oldItems
            };
          }

          element.find('a').bind('click', function(e) {
            e.preventDefault();
            if(hopscotch.getCurrTour()) {
              hopscotch.endTour();
            } else if(jQuery(e.target).hasClass('click-processing')) {
              hopscotch.startTour(tour);
              jQuery('.hopscotch-bubble').addClass('os-tour-notifications');

              // Hide notifications counter when there are none left
              var value = parseInt(jQuery('.slate.alert').text());
              if (value < 1) {
                jQuery('.slate.alert').hide();
              }
            }
          });
	      });
    	},
    }
    }).directive('rightMenuToggle', function() {
        return {
            link: function(scope, element, attrs) {
        	  element.bind('click', function(e) {
        		  e.preventDefault();
        		  jQuery('div#rightMenuSlide').each( function () {
        	        if(this.style.display == 'none') {
        	          jQuery(this).fadeIn('fast');
        	          jQuery(this).addClass('open');
        	        } else {
        	          jQuery(this).fadeOut('fast');
        	          jQuery(this).removeClass('open');
        	        }
        	      });
              })  
            },
          }
        });
})();
