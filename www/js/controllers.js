angular.module('starter')
 
.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.username = AuthService.username();
 
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
 
  
})
.controller('LoginCtrl', function($scope, $rootScope, $state, $ionicPopup, AuthService, $ionicHistory, ngXml2json) {
  $scope.data = {};
 $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };
  $scope.login = function(data) {
    AuthService.login(data.username, data.password).then(function(authenticated) {
      var jsonObject = ngXml2json.parser(authenticated.data);
                console.log("Loaded user", jsonObject);
                if (jsonObject.userdetails.type.userid > 0) {
                    $rootScope.userdropdownproducttype = jsonObject.userdetails.type.producttype.replace('[', '').replace(']', '').split(',');
                    $rootScope.documentlist = jsonObject.userdetails.type.documentlist.replace('[', '').replace(']', '').split(',');
                   
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    AuthService.storeUserCredentials(data.username + '.yourServerToken');

                    $scope.setCurrentUsername(data.username);
                    $state.go('dash', {}, {reload: true});
                    
                    
                } else {
                    $cordovaToast.show('user undefined', 'long', 'center').then(function (success) {
                        console.log("The toast was shown");
                    }, function (error) {
                        console.log("The toast was not shown due to " + error);
                    });
                }
      
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
})
.controller('DashCtrl', function($scope, $state, $http, $ionicPopup, AuthService, $rootScope,ngXml2json, $ionicPopover) {



  //  end

  $scope.selectedDoc = '';
  $rootScope.doc_obj = {};
  $rootScope.doc_info = [];

  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };

  $scope.upload = function() {
   $state.go('upload')
  };

  $scope.statusCheck = function() {
   $state.go('status')
  };

  $scope.pending = function() {
    $state.go('pending');
  };
  $scope.closepopover = function() {
    $state.go('upload');
    $scope.popover.hide();
  };
  $scope.initload = function() {
    $http.get(" http://192.168.100.90:8080/HERO/pages/DHFL_Mobile.jsp?Value=ReUpload&UId=28").success(
      function(data) {
        var jsonObjectstatus = ngXml2json.parser(data);
        $scope.dataStatus = jsonObjectstatus.user.workitem;
        console.log($scope.dataStatus);
      });
    var template = '<ion-popover-view><ion-header-bar> <h1 class="title">Reasons</h1> </ion-header-bar> <ion-content><div class="item" ng-repeat="status in dataStatus"> <lable class="list">Reason: {{status.reason}}</lable> <br><lable class="list">SubReason: {{status.subreason}}</lable> </div> </ion-content><button class="bar bar-footer bar-balanced" ng-click="closepopover()"> <a class="title button button-icon "> ReUpload</a> </button></ion-popover-view>';
    $scope.popover = $ionicPopover.fromTemplate(template, {
      scope: $scope
    });
    $scope.openPopover = function($event) {
      $scope.popover.show($event);
    };
  };

  function generateUUID(){
     var d = new Date().getTime();
     var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         var r = (d + Math.random()*16)%16 | 0;
         d = Math.floor(d/16);
         return (c=='x' ? r : (r&0x3|0x8)).toString(16);
     });
     return uuid;
  }
  $scope.addDoc = function(doc_obj, index) {
    var case_id = generateUUID();
    console.log("ID", case_id);
    if($rootScope.doc_info[0]){
       $state.go('doc')
     } else {
      doc_obj.case_id = case_id;
    
      $rootScope.doc_info.push(doc_obj);
      console.log($rootScope.doc_info);
    $state.go('doc')
     }
    
  }
  
  $scope.uploadData = function(){
    AuthService.storeUserCredentials($rootScope.doc_info);
  }
 
  $scope.pendingUpload = function() {
    $http.get('http://localhost:8100/notauthorized').then(
      function(result) {
        // No result here..
      }, function(err) {
        $scope.response = err;
      });
  };
 
  $scope.status = function() {
    $http.get('http://localhost:8100/notauthenticated').then(
      function(result) {
        // No result here..
      }, function(err) {
        $scope.response = err;
      });
  };
})
.controller('addDocCtrl', function($scope, $rootScope, $state, $http, $ionicPopup, AuthService, $cordovaCamera, ALLOWED_IMAGES_PER_DOCUMENT){
  $scope.dataUrl = 'img/ionic.png';
  $scope.selectedDoc = {};
  $scope.imgs = [];
  $scope.doc = {};
  

  for(var i=0; i< ALLOWED_IMAGES_PER_DOCUMENT; i++){
    $scope.imgs.push({url: 'img/ionic.png', imageAdded: false});
  }

  
 
  $scope.takePicture = function (index) {

            document.addEventListener("deviceready", function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Select Option',
                template: 'Choose from Camera or Gallery',
                cancelText: 'Gallery', // String (default: 'Cancel'). The text of the Cancel button.
                cancelType: 'button-positive', // String (default: 'button-default'). The type of the Cancel button.
                okText: 'Camera', // String (default: 'OK'). The text of the OK button.
                okType: 'button-positive' // String (default: 'button-positive'). The type of the OK button.
            });


            confirmPopup.then(function (res) {
                var options = {
                    quality: 75,
                    destinationType: Camera.DestinationType.FILE_URI,
                    //allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false
                };
                if (res) {
                    options.sourceType = Camera.PictureSourceType.CAMERA;
                } else {
                    options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                }

                $cordovaCamera.getPicture(options).then(function (imageData) {
                    
                    onImageSuccess(imageData);

                    function onImageSuccess(fileURI) {
                        createFileEntry(fileURI);
                    }

                    function createFileEntry(fileURI) {
                        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
                    }

                    // 5
                    function copyFile(fileEntry) {
                                                

                        var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                        var newName = makeid() + name;

                        

                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fileSystem2) {
                                fileEntry.copyTo(
                                    fileSystem2,
                                    newName,
                                    onCopySuccess,
                                    fail
                                );
                            },
                            fail);
                    }

                    // 6
                    function onCopySuccess(entry) {
                        $scope.$apply(function () {
                            $scope.imgs[index].url = entry.nativeURL;
                            $scope.imgs[index].imageAdded = true;
                        });
                      

                    }

                    function fail(err) {
                        $scope.$apply(function () {
                            $scope.response = err;
                        });
                    }

                    function makeid() {
                        var text = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                        for (var i = 0; i < 5; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        return text;
                    }

                }, function (err) {
                    $scope.$apply(function () {
                        $scope.response = err;
                    });

                });
            });
});
        };

  $scope.saveDoc = function(selectedDoc){
      $scope.doc = {document_type: selectedDoc.value, img_url: $scope.imgs};
      $rootScope.doc_info[0].documents.push($scope.doc);
      $state.go('upload');
       
      // AuthService.storeUserCredentials($rootScope.doc_info); 

  };
});
