/* Copyright start
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';

angular.module('cybersponse')
  .controller('editpicklistAsPhases100Ctrl', editpicklistAsPhases100Ctrl);

editpicklistAsPhases100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', '$state', 'Entity', '_'];

function editpicklistAsPhases100Ctrl($scope, $uibModalInstance, config, $state, Entity, _) {
  $scope.cancel = cancel;
  $scope.save = save;
  $scope.config = config;

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  function save() {
    if ($scope.editpicklistAsPhasesForm.$invalid) {
      $scope.editpicklistAsPhasesForm.$setTouched();
      $scope.editpicklistAsPhasesForm.$focusOnFirstError();
      return;
    }

    var selectedPicklistItem = $scope.config.picklistItem;
    var filteredDict = $scope.fieldsArray.filter(function(dict) {
      return dict.name === selectedPicklistItem;
    });
    var selectedPicklistItemIRI = filteredDict.map(function(dict) {
      return dict.options[0]['listName'];
    });
    config.picklistItemIRI = selectedPicklistItemIRI[0];
    $uibModalInstance.close($scope.config);
  }

  function loadAttributes() {
    $scope.fieldsArray = [];
    var entity = new Entity($state.params.module);
    entity.loadFields().then(
      function() {
        $scope.fieldsArray = entity.getFormFieldsArray().filter(function(item) {
          return item.model === 'picklists';
        });
        var selectedPicklistItem = _.find($scope.fieldsArray, function(item) {
          return item.name === config.picklistItem;
        });
        if (config.picklistItem) {
          $scope.loadlistitem(selectedPicklistItem);
        }
      },
      function(error) {
        console.error('Error loading fields:', error);
      }
    );
  }

  function _init() {
    if ($state.params.module) {
      loadAttributes();
    }
  }

  _init();
}
