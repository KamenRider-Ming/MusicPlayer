'use strict';

/**
 * @ngdoc function
 * @name 20170130App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the 20170130App
 */
angular.module('20170130App')
	.controller('MainCtrl', function($scope, $http, $interval) {
		$http.get('../test/color.json').then(function(success) {
			$scope.colors = success.data;
			$http.get('../test/music.json').then(function(success) {
				$scope.audioListData = success.data;
				for (var i in $scope.audioListData) {
					var arr = $scope.audioListData[i].musicurl.split('/');
					var qname = $scope.audioListData[i].musicurl.split('/')[arr.length - 1].split('.');
					qname.pop();
					var name = qname.toString();
					$scope.audioListData[i].name = decodeURIComponent(name);
					$scope.audioListData[i].added = false;
				}
				$scope.pause = true;
				$scope.randomOrCycle = false;
				$scope.songId = -1;
				$scope.pretreatNext = -1;
				$scope.playList = [];
				$scope.playListIndex = -1;
				$scope.songListShowOrHide = false;
				$scope.alonePlay = false;
				$scope.dirHide = true;
				var audio = angular.element('.audio'),
					audiodom = audio.get(0);

				audiodom.volume = 1;
				var songPlay = document.getElementById('song-play'),
					context = songPlay.getContext('2d');

				//画布扩充
				var canvaseExpand = 3;
				songPlay.width *= canvaseExpand;
				songPlay.height *= canvaseExpand;


				$scope.showSongList = function() {
					$scope.songListShowOrHide = true;
					$scope.playListShowOrHide = false;
				}

				$scope.showPlayList = function() {
					$scope.playListShowOrHide = true;
					$scope.songListShowOrHide = false;
				}

				$scope.$watch('songId', musicInit);
				$scope.$watch('currentSong.ended', function(newvalue, oldvalue) {
					if (newvalue != oldvalue && newvalue == true) {
						if ($scope.randomOrCycle) $scope.randomOrCycleOff();
						else $scope.randomOrCycleOn();
						console.log('-----');
						$scope.songId = $scope.pretreatNext;
						$scope.alonePlay = false;
					}
				});

				$scope.$watch('playList', function() {
					if ($scope.playList.length == 0)
						$scope.playListClose();
				}, true);

				$scope.randomOrCycleOff = function() {
					$scope.randomOrCycle = true;
					if ($scope.playList.length == 0 || $scope.alonePlay) {
						$scope.pretreatNext = -1;
					} else {
						$scope.pretreatNext = random($scope.playList.length);
						$scope.pretreatNext = $scope.playList[$scope.pretreatNext];
					}
				};

				$scope.randomOrCycleOn = function() {
					$scope.randomOrCycle = false;
					if ($scope.playList.length == 0 || $scope.alonePlay) {
						$scope.pretreatNext = -1;
					} else {
						$scope.pretreatNext = cycle();
						$scope.pretreatNext = $scope.playList[$scope.pretreatNext];
					}
				};

				$scope.play = function(index, isalone) {
					if (isalone) $scope.alonePlay = true;
					else $scope.playListIndex = index;
					$scope.pause = false;
					$scope.songId = parseInt(angular.element('.music-song-list > .song-list-item').eq(index + 1).attr('songid'));
					clearView(context);
				}

				$scope.add = function(index) {
					$scope.audioListData[index].added = true;
					$scope.playList.push(index);
				}

				$scope.changeDir = function(){
					$scope.dirHide = !$scope.dirHide;
				}

				$scope.download = function() {};

				$scope.remove = function(index, songId) {
					$scope.playList.splice(index, 1);
					$scope.audioListData[songId].added = false;
				}

				$scope.songListClose = function() {
					$scope.songListShowOrHide = false;
				}

				$scope.playListClose = function() {
					$scope.playListShowOrHide = false;
				}

				$scope.prevSong = function() {
					if($scope.alonePlay) return;
					if ($scope.playListIndex - 1 < 0) $scope.playListIndex = $scope.playList.length - 1;
					else $scope.playListIndex --;
					$scope.songId = $scope.playList[$scope.playListIndex];
					clearView(context);
				};
				$scope.nextSong = function() {
					if($scope.alonePlay) return;
					console.log($scope.playListIndex);
					if ($scope.playListIndex + 1 > $scope.playList.length - 1) $scope.playListIndex = 0;
					else $scope.playListIndex ++;
					$scope.songId = $scope.playList[$scope.playListIndex];
					clearView(context);
				};

				function random(len) {
					return parseInt(Math.random() * len);
				}

				function cycle() {
					var id = $scope.songId + 1;
					if (id > $scope.playList.length - 1) id = 0;
					return id;
				}

				$scope.voicectrl = function() {
					var voiceBak = angular.element('.music-voice-bak')[0],
						voiceBakOffsetLeft = voiceBak.offsetLeft,
						viewOffsetLeft = angular.element('.music-view')[0].offsetLeft,
						allOffsetLeft = (320 - voiceBak.clientWidth) / 2 + viewOffsetLeft + 5,
						b = parseInt((event.clientX - allOffsetLeft) / (voiceBak.clientWidth - 10) * 100);
					angular.element('.music-voice-over').width(b + "%");
					if (b < 0) b = 0;
					if (b > 100) b = 100;
					audiodom.volume = b / 100;
				}

				function clearView(context) {
					context.clearRect(0, 0, songPlay.width, songPlay.height);
				}

				function musicInit() {
					if ($scope.songId < 0) {
						clearView(context);
						$scope.pause = true;
						return;
					}
					var newvalue;
					do {
						newvalue = random($scope.colors.length);
					} while ($scope.curcolor == newvalue);
					$scope.curcolor = newvalue;
					audioready(audio, audiodom);
				}

				function musicPlaying(context, musicangle, canvaseExpand) {
					var x = 75 * canvaseExpand,
						y = 75 * canvaseExpand,
						r = 68 * canvaseExpand;
					musicangle = musicangle - Math.PI * 0.5;
					context.beginPath();
					context.arc(x, y, r, -Math.PI * 0.5, musicangle, 0);
					context.strokeStyle = $scope.colors[$scope.curcolor];
					context.lineWidth = 15 * canvaseExpand;
					context.stroke();
					var nx = r * Math.sin(Math.PI - (musicangle + Math.PI * 0.5)) + x,
						ny = r * Math.cos(Math.PI - (musicangle + Math.PI * 0.5)) + x,
						nr = 3 * canvaseExpand;

					context.beginPath();
					context.arc(nx, ny, nr, 0, Math.PI * 2, 1);
					context.closePath();
					context.strokeStyle = $scope.colors[$scope.curcolor];
					context.lineWidth = 7 * canvaseExpand;
					context.stroke();
				}



				function audioready(audio, audiodom) {
					audio.on('loadedmetadata', function() {
						$scope.$watch('pause', function(newvalue, oldvalue) {
							if (oldvalue == newvalue) return;
							if (newvalue) audiodom.pause();
							else audiodom.play();
						});


						if ($scope.pause) audiodom.pause();
						else audiodom.play();
						$scope.currentSong = {
							name: $scope.audioListData[$scope.songId].name,
							allTime: audiodom.duration,
							currentTime: audiodom.currentTime,
							ended: false
						};
						$scope.$apply();
						$scope.promisetime = $interval(function() {
							$scope.currentSong.currentTime = audiodom.currentTime;
						}, 1000, null, true);

						var processAnimation = function() {
							musicPlaying(context, Math.PI * 2 * audiodom.currentTime / $scope.currentSong.allTime, canvaseExpand);
							$scope.currentSong.ended = audiodom.ended;
							if (audiodom.ended) {
								musicPlaying(context, Math.PI * 2, canvaseExpand);
								$interval.cancel($scope.promisetime);
								return;
							}
							requestAnimationFrame(processAnimation);
						};

						requestAnimationFrame(processAnimation);

					});
				}
			}).catch(function(error) {
				console.log(error);
			});
		}).catch(function(error) {});



	});