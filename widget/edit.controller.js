/* Copyright start
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';

angular.module('cybersponse').controller('editPicklistAsPhases100Ctrl', editPicklistAsPhases100Ctrl);

editPicklistAsPhases100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', '$state', 'Entity', '_'];

function editPicklistAsPhases100Ctrl($scope, $uibModalInstance, config, $state, Entity, _) {
  $scope.cancel = cancel;
  $scope.save = save;
  $scope.config = config;

  // Function to cancel the modal dialog
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  // Function to save changes made in the modal dialog
  function save() {
    // Check if the form is invalid
    if ($scope.editPicklistAsPhasesForm.$invalid) {
      // Set the form as touched to display error messages
      $scope.editPicklistAsPhasesForm.$setTouched();
      // Focus on the first error in the form
      $scope.editPicklistAsPhasesForm.$focusOnFirstError();
      return;
    }

    // Filter the fields array to find the dictionary containing the picklist item
    var filteredDict = $scope.fieldsArray.filter(function (dict) {
      return dict.name === config.picklistItem;
    });
    // Update configuration properties based on the filtered dictionary
    $scope.config.picklistFieldObject = filteredDict[0];
    $uibModalInstance.close($scope.config);
  }

  // Function to load attributes(fields) of the module of type picklists
  function loadAttributes() {
    $scope.fieldsArray = [];
    var entity = new Entity($state.params.module);
    entity.loadFields().then(
      function () {
        $scope.fieldsArray = entity.getFormFieldsArray().filter(function (item) {
          return item.model === 'picklists';
        });
      },
      function (error) {
        console.error('Error loading fields:', error);
      },
    );
  }

  // Function to initialize attributes(fields) loading if module parameter is present in the state
  function _init() {
    if ($state.params.module) {
      loadAttributes();
    }
  }

  _init();
}
