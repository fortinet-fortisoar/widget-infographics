/* Copyright start
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';

angular.module('cybersponse').controller('picklistAsPhases100Ctrl', picklistAsPhases100Ctrl);

picklistAsPhases100Ctrl.$inject = ['$scope', 'FormEntityService', '$state', '$interval', 'Modules', 'config', 'websocketService', 'picklistsService', '$rootScope', 'API', '$resource', 'widgetBasePath', '$timeout', '_'];

function picklistAsPhases100Ctrl($scope, FormEntityService, $state, $interval, Modules, config, websocketService, picklistsService, $rootScope, API, $resource, widgetBasePath, $timeout, _) {
  var widgetsubscription;
  $scope.config = config;
  $scope.title = '';
  $scope.currentTheme = $rootScope.theme.id;
  $scope.entity = FormEntityService.get();
  $scope.widgetBasePath = widgetBasePath;
  $scope.widgetCssPath = widgetBasePath + 'widgetAssets/css/infoGraphics.css';
  $scope.visibility = $scope.entity.fields[$scope.config.picklistItem]['visible'];
  $scope.handleClick = handleClick;
  $scope.pickListValue = $scope.entity['originalData'][$scope.config.picklistItem] ? $scope.entity['originalData'][$scope.config.picklistItem]['itemValue'] : '';
  $scope.notifyFieldChange = notifyFieldChange;
  $scope.viewValueChange = viewValueChange;
  $scope.activeItemImage = widgetBasePath + 'images/' + ($scope.currentTheme === 'light' ? 'light_theme_active_chevron.png' : 'chevron_active_arrow.png');
  $scope.inactiveItemImage = widgetBasePath + 'images/' + ($scope.currentTheme === 'light' ? 'light_theme_inactive_chevron.png' : 'chevron_inactive_arrow.png');

  // Initialize the application
  function init() {
    widgetWSSubscribe();
    getPicklistValues();
  }

  // Function to notify field change
  function notifyFieldChange(value, field) {
    field.value = value;
    $scope.viewValueChange(field);
    $rootScope.$broadcast('csFields:viewValueChange', {
      field: field,
      entity: $scope.entity,
    });
  }

  //Function to handle the value change for a field
  function viewValueChange(field) {
    if ($scope.entity.fields.hasOwnProperty(field.name)) {
      $scope.entity.fields[field.name].value = field.value;
      $scope.entity.fields[field.name].saving = true;
      $timeout(function () {
        $scope.entity.fields[field.name].saving = false;
      }, 1000);
      $scope.entity.evaluateAllFields();
      return true;
    }
    return false;
  }

  //Fetch all the picklist itemValue of the selected picklist and sort them based upon the order Index
  function getPicklistValues() {
    picklistsService
      .getPicklistByIri($scope.config.picklistFieldObject['options'][0]['listName'])
      .then(function (data) {
        $scope.picklistObject = data.picklists.sort((a, b) => a.orderIndex - b.orderIndex);
      })
      .catch(function (error) {
        console.error('Error fetching picklist values:', error);
      });
  }

  // Event listener for template refresh
  $scope.$on('template:refresh', function (event, changedFields) {
    angular.forEach(changedFields, function (field) {
      // Notify the change of the field value
      $scope.notifyFieldChange(field.value, field);
    });
    init();
  });

  // Event listener for destroying the scope
  $scope.$on('$destroy', function () {
    if (widgetsubscription) {
      websocketService.unsubscribe(widgetsubscription);
    }
    $interval.cancel($scope.timeinterval);
  });

  // Event listener for WebSocket reconnection
  $scope.$on('websocket:reconnect', function () {
    widgetWSSubscribe();
  });

  // Function to handle click event and update the selected picklist value
  function handleClick(picklistItem) {
    if (picklistItem['itemValue'] !== $scope.pickListValue) {
      var api_url = API.API_3_BASE + $scope.entity.name + '/' + $scope.entity.id;
      var payload = {};
      payload[config.picklistItem] = picklistItem['@id'];
      $resource(api_url, null, {
        update: {
          method: 'PUT',
        },
      })
        .update(payload)
        .$promise.then(function () {
          $scope.pickListValue = picklistItem['itemValue'];
          //Broadcasting the Update Event
          notifyFieldChange(picklistItem, $scope.config.picklistFieldObject);
        })
        .catch(function (error) {
          console.error('Error updating resource:', error);
        });
    }
  }

  // Function to subscribe to WebSocket for widget updates
  function widgetWSSubscribe() {
    websocketService
      .subscribe($state.params.module + '/' + $state.params.id, function (result) {
        var changedAttribute;
        if (angular.isDefined(result.changeData)) {
          if (result.changeData.includes($scope.config.picklistItem)) {
            changedAttribute = $scope.config.picklistItem;
          }
        }
        // If the picklist item has changed, update the entity and picklist value
        if (changedAttribute) {
          //Added the timeout to avoid race condition in the alerts record updating.
          $timeout(function () {
            $scope.entity = FormEntityService.get();
            $scope.pickListValue = $scope.entity['fields'][$scope.config.picklistItem]['value'] ? $scope.entity['fields'][$scope.config.picklistItem]['value']['itemValue'] : '';
            firstTimeLoad = false;
          }, 250);
        }
      })
      .then(function (data) {
        widgetsubscription = data;
      });
  }

  init();
}
