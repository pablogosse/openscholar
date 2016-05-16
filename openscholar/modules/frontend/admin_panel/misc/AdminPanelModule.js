(function ($) {
  var paths;
  var vsite;
  var cid;
  var uid;
  var morphButton;

    angular.module('AdminPanel', [ 'os-auth', 'ngCookies','ngStorage', 'RecursionHelper'])
    .config(function () {
       paths = Drupal.settings.paths
       vsite = typeof Drupal.settings.spaces != 'undefined' ? Drupal.settings.spaces.id : 0;
       cid = Drupal.settings.admin_panel.cid + Drupal.settings.version.adminPanel;
       uid = Drupal.settings.admin_panel.user;
                    
    }).service('adminMenuStateService', ['$sessionStorage', function ($ss) {
      $ss['menuState'] = $ss['menuState'] || {};

      this.SetState = function (key, state) {
        $ss['menuState'][key] = state;
      }

      this.GetState = function (key) {
        return $ss['menuState'][key] === true;
      }
    }])
    .controller("AdminMenuController",['$scope', '$http', 'adminMenuStateService', '$localStorage', function ($scope, $http, $menuState, $localStorage) {

      var menu = 'admin_panel';
      $scope.paths = paths;
      
      $scope.getListStyle = function(id) {
        if ($menuState.GetState(id)) {
          return {'display':'block'};
        }
        return {};
      };
      
      //Force menu open Special case
       if (window.location.search.indexOf('login=1') > -1) {
         $menuState.SetState('main', true);
       }
      //Init storage
      $localStorage.admin_menu = $localStorage.admin_menu || {};
      $localStorage.admin_menu[uid] = $localStorage.admin_menu[uid] || {};
      $localStorage.admin_menu[uid][vsite] = $localStorage.admin_menu[uid][vsite] || {};
      
      // Check for the menu data in local storage.
      if ($localStorage.admin_menu[uid][vsite][cid]) {
        $scope.admin_panel = $localStorage.admin_menu[uid][vsite][cid];
        
        if ($menuState.GetState('main')) {
          // Turn off transitions and toggle open, there are a bunch of damn set-timeouts in morphbutton so we need to delay things here.
          window.setTimeout(function () {
            morphButton.openTransition = false;
            morphButton.toggle();
            morphButton.openTransition = true;
            jQuery('.morph-button').addClass('scroll');
          },1);  
          
          window.setTimeout(function () {
            jQuery('.morph-button').removeClass('no-transition');
          },1000);
        } else {
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
          if ($menuState.GetState('main')) {
            morphButton.toggle();
          } else {
        	  // Set the menu state to closed.
            jQuery('.morph-button').addClass('scroll');
          }
        }); 
      
     
    }]).directive('toggleOpen', ['$cookies', 'adminMenuStateService', function($cookies, $menuState) {
      
      function openLink(elm) {
        elm.addClass('open');
        elm.children('ul').slideDown(200);
      }
      
      function closeLink(elm) {
        elm.removeClass('open');
        elm.children('ul').css('display', 'none');
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

          if ($menuState.GetState(attrs.id)) {
            parent.addClass('open');
          }

          element.bind('click', function() {
            // close all sibling links regardless of what type of link this is
            var isOpen = $menuState.GetState(attrs.id);

            if ( element.hasClass('close-siblings') ) {
              var li = element.parent().parent();
              var togglers = angular.element(li.parent()[0].querySelectorAll('li.open'));

              togglers.each(function() {
                var sibling = angular.element(this),
                  id = sibling.find("span").children().first().attr('id');
                $menuState.SetState(id, false);
                closeLink(sibling);
              });
            }

            // if this link has children, toggle their visibility.
            if (element.hasClass('toggleable')){
              element.removeAttr('href');

              if (!isOpen) {
                $menuState.SetState(attrs.id, true);
                openLink(parent);
              }
            }
          });
        },
      };
      
    }]).directive('leftMenu', ['$timeout', 'adminMenuStateService', function($t, $menuState) {
      
      return {
        templateUrl: paths.adminPanelModuleRoot+'/templates/admin_menu.html?vers='+Drupal.settings.version.adminPanel,
        controller: 'AdminMenuController',
        link: function(scope, element, attrs) {
          morphButton = new UIMorphingButton(element[0], {
            closeEl : '.icon-close',
            closeEl2 : '.close-panel',
            onBeforeOpen : function() {
              // push main admin_panel
              jQuery('#page_wrap, .page-cp #page, .page-cp #branding').addClass('pushed');
            },
            onAfterOpen : function() {
              // add scroll class to main el
              jQuery('.morph-button').addClass('scroll');
              $t(function () {
                $menuState.SetState('main', true);
              }, 1);
            },
            onBeforeClose : function() {
              jQuery('.morph-button').removeClass('scroll');
              jQuery('#page_wrap, .page-cp #page, .page-cp #branding').removeClass('pushed');
              $t(function () {
                $menuState.SetState('main', false);
              }, 1)
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
    .directive('adminPanelMenuRow', ['RecursionHelper', 'adminMenuStateService', function (RecursionHelper, $menuState) {

        function link(scope, elem, attrs) {
          scope.getListStyle = function (id) {
            if ($menuState.GetState(id)) {
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
