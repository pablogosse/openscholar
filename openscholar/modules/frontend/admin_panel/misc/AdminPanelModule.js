(function ($) {
  var paths;
  var vsite;
  var cid;
  var uid;
  var auto_open;
  var morphButton;
  var menu_state;

    angular.module('AdminPanel', [ 'os-auth', 'ngCookies','ngStorage', 'RecursionHelper'])
    .config(function () {
       paths = Drupal.settings.paths
       vsite = typeof Drupal.settings.spaces != 'undefined' ? Drupal.settings.spaces.id : 0;
       cid = Drupal.settings.admin_panel.cid + Drupal.settings.version.adminPanel;
       uid = Drupal.settings.admin_panel.user;
       auto_open = Drupal.settings.admin_panel.keep_open;
                    
    }).controller("AdminMenuController",['$scope', '$http', '$cookies','$localStorage', function ($scope, $http, $cookies, $localStorage) {
    
      auto_open = ($cookies.getObject('osAdminMenuOpen') == 1) ? true : false;
      var menu = 'admin_panel';
      $scope.paths = paths;

      menu_state = $cookies.getObject('osAdminMenuState')
      
      $scope.getListStyle = function(id) {
        console.log(id);
        if (typeof(menu_state) !== 'undefined' && typeof(menu_state[id]) !== 'undefined' && menu_state[id]) {
          return {'display':'block'};
        }
        return {};
      };
      
      //Force menu open Special case
      var force_open = (window.location.search.indexOf('login=1') > -1);
      //Init storage
      if (typeof($localStorage.admin_menu) == 'undefined') {
        $localStorage.admin_menu = {};
      }
      if (typeof($localStorage.admin_menu[uid]) == 'undefined') {  
        $localStorage.admin_menu[uid] = {};
      }
      
      // Check for the menu data in local storage.
      if (typeof($localStorage.admin_menu[uid]) !== 'undefined' && typeof($localStorage.admin_menu[uid][vsite]) !== 'undefined' && typeof($localStorage.admin_menu[uid][vsite][cid]) !== 'undefined') {
        $scope.admin_panel = $localStorage.admin_menu[uid][vsite][cid];
        
        if (force_open || auto_open || (typeof(menu_state) !== 'undefined' && typeof(menu_state.main) !== 'undefined' && menu_state.main)) {
          // Turn off transitions and toggle open, there are a bunch of damn set-timeouts in morphbutton so we need to delay things here.
          window.setTimeout(function () {
            morphButton.openTransition = false;
            morphButton.toggle();
            morphButton.openTransition = true;
            jQuery('.morph-button').addClass('scroll');
          },1);  
          
          window.setTimeout(function () {
          jQuery('.morph-button').removeClass('no-transition');
          morphButton.isAnimating = false;
          morphButton.expanded = true;
          },1000);
        } else {
          if (typeof(menu_state) !== 'undefined') {
            menu_state.main = false;
          }
          jQuery('.morph-button').removeClass('no-transition');
        }
        
        return;
      }
      
      //Go get the admin menu from the server.
      params = { cid: cid, uid: uid};
      if (vsite) {
        params.vsite = vsite;
      }
      
      var url = paths.api + '/cp_menu/' + menu;
      $http({method: 'get', url: url, params: params, cache: true}).
        then(function(response) {
          //Clear out old entries.
          $localStorage.admin_menu[uid][vsite] = {};
          $localStorage.admin_menu[uid][vsite][cid] = response.data.data;
          $scope.admin_panel = response.data.data;
          if (force_open || (auto_open && typeof(menu_state) !== 'undefined' && typeof(menu_state.main) !== 'undefined' && menu_state.main)) {
          morphButton.toggle();
          } else if (typeof(menu_state) !== 'undefined') {

        	//Set the menu state to closed.
            menu_state.main = true;
            jQuery('.morph-button').addClass('scroll');
          }
        }); 
      
     
    }]).directive('toggleOpen', ['$cookies', function($cookies) {
    
      if (typeof(menu_state) == 'undefined') {
        menu_state = {'main': false};  
      }
      
      function openLink(elm) {
        elm.addClass('open');
        elm.children('ul').slideDown(200);
      }
      
      function closeLink(elm) {
        elm.removeClass('open');
        //elm.find('li').removeClass('open');
        //elm.find('ul').slideUp(200);
      }

      function getAncestor(elem, tagName) {
        tagName = tagName.toUpperCase();
        while (elem[0].tagName != tagName) {
          if (elem[0].tagName == 'BODY') {
            return false;
          }
          elem = elem.parent();
        }

        return elem;
      }
      
      return {
        link: function(scope, element, attrs) {
          var parent = getAncestor(element, 'li');
          if (element[0].nodeName == 'UL') {
            if (parent.hasClass('open')) {
              element.css('display','block');
            }
            return;
          }

          if (typeof(menu_state) !== 'undefined' && typeof(menu_state[attrs.id]) !== 'undefined' && menu_state[attrs.id]) {
            parent.addClass('open');
          }

          element.bind('click', function() {
            // close all sibling links regardless of what type of link this is
            var isOpen = menu_state[attrs.id];

            if ( element.hasClass('close-siblings') ) {
              if ( parent.hasClass('heading') ) {
                var togglers = parent.parent().parent().find('li.open');
              }
              else {
                var togglers = parent.parent().siblings('.open');
              }

              togglers.each(function() {
                var sibling = angular.element(this);
                menu_state[sibling.find("span").children().first().attr('id')] = false;
                closeLink(sibling);
              });
            }

            // if this link has children, toggle their visibility.
            if (element.hasClass('toggleable')){
              element.removeAttr('href');

              if (!isOpen) {
                menu_state[attrs.id] = true;
                openLink(parent);
              }
            }

            scope.$apply(function () {
              $cookies.putObject('osAdminMenuState', menu_state, {path:'/'});
            });
          });
        },
      };
      
    }]).directive('leftMenu', ['$cookies', function($cookies) {
      if (typeof(menu_state) == 'undefined') {
        menu_state = $cookies.getObject('osAdminMenuState');
      }
      // If it is still undefined init it.
      if (typeof(menu_state) == 'undefined') {
        menu_state = {'main': false};  
      }
      
      return {
       templateUrl: paths.adminPanelModuleRoot+'/templates/admin_menu.html?vers='+Drupal.settings.version.adminPanel,
       controller: 'AdminMenuController',
       link: function(scope, element, attrs) {
    	  morphButton = new UIMorphingButton(element[0], {
      			closeEl : '.icon-close',
      			onBeforeOpen : function() {
      				// push main admin_panel
      				jQuery('#page_wrap, .page-cp #page, .page-cp #branding').addClass('pushed');
      			},
      			onAfterOpen : function() {
      			  // add scroll class to main el
      			  jQuery('.morph-button').addClass('scroll');
      			  menu_state['main'] = true;
      			  Drupal.settings.admin_panel.keep_open = true;
      			  scope.$apply(function () {
        	        $cookies.putObject('osAdminMenuState', menu_state, {path:'/'});
                  $cookies.putObject('osAdminMenuOpen', 1);
        	      });
      			},
      			onBeforeClose : function() {
      			  jQuery('.morph-button').removeClass('scroll');
      			  jQuery('#page_wrap, .page-cp #page, .page-cp #branding').removeClass('pushed');
      			  menu_state['main'] = false;
        		  scope.$apply(function () {
          	        $cookies.putObject('osAdminMenuState', menu_state, {path:'/'});
          	      });
      			},
      			onAfterClose : function() {
                  scope.$apply(function () {
                    $cookies.putObject('osAdminMenuOpen', 0);
                  });
                }
      		}); 
  	   }
     };
   }]).directive('addLocation', function() {
    //For Qualtrics URL Remove after beta
      return {
        link: function(scope, element, attrs) {
        element.attr('href', attrs.href + '?osurl=' + encodeURIComponent(location.href) + '&uid=' + uid);
        },
      }
    })
    .directive('adminPanelMenuRow', ['RecursionHelper', function (RecursionHelper) {

        function link(scope, elem, attrs) {
          scope.getListStyle = function (id) {
            if (typeof(menu_state) !== 'undefined' && typeof(menu_state[id]) !== 'undefined' && menu_state[id]) {
              return {'display':'block'};
            }
            return {};
          };

          scope.isActive = function (row) {
            if (row.children) {
              for (var k in row.children) {
                var c = row.children[k];
                if (scope.isActive(c)) {
                  return true;
                }
              }
              return false;
            }
            else if (row.type == 'link' && row.href == location.href) {
              return true;
            }
            else {
              return false;
            }
          }
        }

        return {
          scope: {
            menuRow: '=',
            key: '@'
          },
          templateUrl: paths.adminPanelModuleRoot + '/templates/adminPanelMenuRow.template.html?vers=' + Drupal.settings.version.adminPanel,
          compile: function (element) {
            // workaround so directives can be nested
            return RecursionHelper.compile(element, link);
          }
        };
      }]);
  
})(jQuery);
