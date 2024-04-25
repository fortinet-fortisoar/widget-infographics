/* Copyright start
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';

angular.module('cybersponse')
  .controller('picklistAsPhases100Ctrl', picklistAsPhases100Ctrl);

picklistAsPhases100Ctrl.$inject = ['$scope', 'FormEntityService', '$state', '$interval', 'Modules', 'config', 'websocketService', 'picklistsService', '$rootScope', 'API', '$resource','widgetBasePath', '_'];

function picklistAsPhases100Ctrl($scope, FormEntityService, $state, $interval, Modules, config, websocketService, picklistsService, $rootScope, API, $resource,widgetBasePath, _) {
  var widgetsubscription;
  $scope.config = config;
  $scope.title = '';
  var currentTheme = $rootScope.theme.id;
  $scope.entity = FormEntityService.get();
  $scope.pickListValue = $scope.entity['originalData'][config.picklistItem] ? $scope.entity['originalData'][config.picklistItem]['itemValue'] : '';
  $scope.activeItemImage = currentTheme === 'light' ? widgetBasePath+'images/light_theme_active_chevron.png' : widgetBasePath+'images/chevron_active_arrow.png';
  $scope.inactiveItemImage = currentTheme === 'light' ? widgetBasePath+'images/light_theme_inactive_chevron.png' : widgetBasePath+'images/chevron_inactive_arrow.png';

  function init() {
    widgetWSSubscribe();
    getPicklistValues();
  }

  function getPicklistValues() {
    Modules.get({
        module: $state.params.module,
        id: $state.params.id,
        __selectFields: config.picklistItem
      })
      .$promise.then(function(result) {
        picklistsService.getPicklistByIri(config.picklistItemIRI).then(function(data) {
          $scope.picklistObject = data.picklists.sort((a, b) => a.orderIndex - b.orderIndex);
        }).catch(function(error) {
          console.error('Error fetching picklist values:', error);
        });
      })
      .catch(function(error) {
        console.error('Error fetching module data:', error);
      });
  }

  $scope.$on('$destroy', function() {
    if (widgetsubscription) {
      websocketService.unsubscribe(widgetsubscription);
    }
    $interval.cancel($scope.timeinterval);
  });

  $scope.$on('websocket:reconnect', function() {
    widgetWSSubscribe();
  });

  function handleClick(pickListValue, picklistItemIRI) {
    if (pickListValue !== $scope.pickListValue) {
      var api_url = API.API_3_BASE + $scope.entity.name + '/' + $scope.entity.id;
      var payload = {};
      payload[config.picklistItem] = picklistItemIRI;
      $resource(api_url, null, {
          update: {
            method: 'PUT'
          }
        })
        .update(payload)
        .$promise.then(function() {
          $scope.pickListValue = pickListValue;
        })
        .catch(function(error) {
          console.error('Error updating resource:', error);
        });
    }
  }

  function widgetWSSubscribe() {
    if (widgetsubscription) {
      websocketService.unsubscribe(widgetsubscription);
    }
    websocketService.subscribe($state.params.module + '/' + $state.params.id, function(result) {
      var changedAttribute;
      widgetsubscription = result;
      if (angular.isDefined(result.changeData)) {
        if (result.changeData.includes(config.picklistItem)) {
          changedAttribute = config.picklistItem;
        }
      }
      if (changedAttribute) {
        $scope.entity = FormEntityService.get();
        $scope.pickListValue = $scope.entity['fields'][config.picklistItem]['value'] ? $scope.entity['fields'][config.picklistItem]['value']['itemValue'] : '';
      }
    });
  }

  init();
  $scope.handleClick = handleClick;
}
