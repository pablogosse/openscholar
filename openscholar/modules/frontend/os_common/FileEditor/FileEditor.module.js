(function ($) {
  var libraryPath = '';

  angular.module('FileEditor', ['EntityService', 'os-auth', 'TaxonomyWidget']).
    config(function () {
      libraryPath = Drupal.settings.paths.FileEditor;
    }).
    constant("FILEEDITOR_RESPONSES", {
      SAVED: "saved",
      REPLACED: "replaced",
      NO_CHANGES: "no changes",
      CANCELED: "canceled"
    }).
    directive('fileEdit', ['EntityService', '$http', '$timeout', '$filter', 'FILEEDITOR_RESPONSES', function (EntityService, $http, $timeout, $filter, FER) {
      return {
        scope: {
          file :  '=',
          onClose : '&'
        },
        templateUrl: libraryPath + '/file_edit_base.html?vers='+Drupal.settings.version.FileEditor,
        link: function (scope, elem, attr, c, trans) {
          var fileService = new EntityService('files', 'id'),
              files = [],
              file_replaced = false;

          fileService.fetch().then(function (data) {
            files = data;
            return data;
          });

          scope.fileEditAddt = '';
          scope.date = '';
          scope.description_label = 'Descriptive Text - will display under the filename';
          scope.schema = '';
          scope.$watch('file', function (f) {

            if (!f) {
              return;
            }

            scope.schema = f.schema;
            scope.fileEditAddt = libraryPath+'/file_edit_'+f.type+'.html?vers='+Drupal.settings.version.FileEditor;
            scope.date = $filter('date')(f.timestamp+'000', 'short');
            scope.file.terms = scope.file.terms || [];

            scope.fullPath = f.url.slice(0, f.url.lastIndexOf('/')+1);
            scope.extension = '.' + getExtension(f.url);
            if (scope.file.type == 'image') {
              scope.description_label = 'Image Caption';
            }
          });

          var dateTimeout;
          scope.$watch('date', function (value, old) {
            if (value == old ) return;
            scope.invalidDate = false;
            var d = new Date(value);
            if (isNaN(d.getTime())) {
              scope.invalidDate = true;
              return;
            }
            if (d) {
              scope.file.timestamp = parseInt(d.getTime() / 1000);
              if (dateTimeout) {
                $timeout.cancel(dateTimeout);
              }
              dateTimeout = $timeout(function () {
                scope.date = $filter('date')(scope.file.timestamp+'000', 'short');
              }, 3000);
            }
          });

          scope.invalidFileName = false;
          scope.$watch('file.filename', function (filename, old) {
            if (typeof filename != 'string' || !scope.file) {
              return;
            }
            if (scope.file.schema == 'oembed') {
              scope.invalidFileName = false;
              return;
            }
            scope.invalidFileName = false;
            if (filename == "") {
              scope.invalidFileName = true;
              return;
            }
            if (!filename.match(/^([a-zA-Z0-9_\.-]*)$/)) {
              scope.invalidFileName = true;
              return;
            }
            var lower = filename.toLowerCase();
            if (lower != old) {
              for (var i in files) {
                if (lower == files[i].filename && scope.file.id != files[i].id) {
                  scope.invalidFileName = true;
                  return;
                }
              }
            }
          });

          scope.invalidName = true;
          scope.$watch('file.name', function (name, old) {
            if (!name) {
              scope.invalidName = true;
            }
            else {
              scope.invalidName = false;
            }
          });

          scope.showWarning = false;
          scope.showSuccess = false;
          scope.replaceReject = false;
          scope.validate = function ($file) {
            if (!$file) return true;

            if (getExtension(scope.file.url) == getExtension($file.name)) {
              return true;
            }

            return false;
          };

          scope.displayWarning = function() {
            scope.showWarning = true;
          };

          scope.prepForReplace = function ($files, $event, $rejectedFiles) {
            if ($event.type != 'change') return;
            if ($files.length) {
              var file = $files[0],
                fields = {};

              if (typeof Drupal.settings.spaces != 'undefined') {
                fields.vsite = Drupal.settings.spaces.id
              }

              var config = {
                headers: {
                  'Content-Type': file.type
                }
              };

              $http.put(Drupal.settings.paths.api + '/files/' + scope.file.id, file, config)
                .success(function (result) {
                  scope.showWarning = false;
                  scope.replaceSuccess = true;
                  file_replaced = true;

                  fileService.register(result.data[0]);

                  $timeout(function () {
                    scope.replaceSuccess = false;
                  }, 5000);
                })
              .error(function (error) {
                  scope.errorMessages = error.title;
                  scope.showErrorMessages = true;
              });
            }
            else {
              scope.replaceReject = true;
              $timeout(function () {
                scope.replaceReject = false;
              }, 5000);
            }
          };

          scope.canSave = function () {
            return scope.invalidFileName || scope.invalidName;
          };

          scope.save = function () {
            fileService.edit(scope.file, ['preview', 'url', 'size', 'changed']).then(function(result) {
                if (result.data || typeof scope.file.new != 'undefined') {
                  scope.onClose({saved: FER.SAVED});
                }
                else if (file_replaced) {
                  scope.onClose({saved: FER.REPLACED});
                }
                else if (result.detail) {
                  scope.onClose({saved: FER.NO_CHANGES});
                }
                else {
                  scope.onClose({saved: FER.CANCELED});
                }
            },
            function(result) {
              switch (result.status) {
                case 409:
                  scope.errorMessages = 'Please wait. Another member of your website has updated this file since you last updated it, and we\'re retrieving an updated version. Once this message disappears, you\'ll need re-enter any changes you had made.<br><img src="'+Drupal.settings.paths.FileEditor+'/large-spin_loader.gif" class="file-retrieve-spinner">';
                  scope.showErrorMessages = true;
                  break;
                case 410:
                  scope.errorMessages = 'This file has been deleted. It will be removed from your listing shortly.';
                  scope.showErrorMessages = true;
                  scope.deletedRedirect = true;
                  break;
                default:
                  scope.errorMessages = result.data.title.replace(/[^\s:]*: /, '');
                  scope.showErrorMessages = true;
              }
            });
          }

          scope.$on('EntityCacheUpdater.cacheUpdated', function () {
            if (scope.showErrorMessages) {
              $timeout(function () {
                scope.showErrorMessages = false;
              }, 5000);
              scope.file = angular.copy(fileService.get(scope.file.id));
            }
          });

          scope.cancel = function () {
            scope.onClose({saved: file_replaced ? FER.REPLACED : FER.CANCELED});
          }

          scope.closeErrors = function () {
            scope.showErrorMessages = false;
            if (scope.deletedRedirect) {
              scope.deletedRedirect = false;
              scope.cancel();
            }
          }
        }
      }
    }]);

  function getExtension(url) {
    return url.slice(url.lastIndexOf('.')+1, (url.lastIndexOf('?') != -1)?url.lastIndexOf('?'):url.length).toLowerCase();
  }

})(jQuery);
