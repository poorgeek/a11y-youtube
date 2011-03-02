/*
 * YouTube Video Plugin
 *
 * Copyright (c) 2010 Devis
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * Revisions:
 * @version 0.2 - Original version by Trevor Davis of http://www.viget.com
 * @version 0.3 - Updated version to support various other features of the YouTube JavaScript API
 * @version 0.4 - Added support you
 */
(function($) {
	$.fn.a11y_youtube = function(options) {
		var config = {
	        videoWidth      : '640',          // width of the embedded player
	        videoHeight     : '390',          // height of the embedded player
	        videoIdBase     : 'a11y-youtube', // string base to use for each video id 
	        useHTTPS        : false,          // true if embedding the video on a page behind SSL
	        protectPrivacy  : false,          // true to use YouTube's privacy enhanced mode (http://www.google.com/support/youtube/bin/answer.py?answer=171780&expand=PrivacyEnhancedMode#privacy)
	        showPause       : true,           // false to hide the pause button
	        showVideoNav    : true,           // false to hide the forward and rewind controls
	        showVolume      : true,           // false to hide volume controls 
	        showReplay      : false,          // true to show replay controls
	        showMute        : true,           // false to hide mute controls
	        params : { 
	            allowScriptAccess: 'always',
	            wmode: 'transparent'
	        }
		};
		if (options) {
			$.extend(config, options);
		}
		return this.each(function(i) {
            var $link = $(this),

                // set variables
                url = $link.attr('href'),
                linkText = $link.text(),
                videoId = $link.attr('id') || config.videoIdBase + i,
                ytVideoId = url.substr(31),

                // new DOM elements
                $video = $link.hide().wrap('<div class="video-player"></div>').parent(),
                $controls = $('<ul class="video-controls"></ul>').appendTo($video),
                $toReplace = $('<div class="video"></div>').prependTo($video).attr('id', videoId),
                $mute,
                $play,
                $pause,
                $forward,
                $rewind,
                $volumeUp,
                $volumeDown,
                $replay,

                // set up the special player object
                player;

            // bind public methods up front for playing, pausing, muting, etc...
            $video.bind('togglePlay', function() {
                $video.togglePlay();
            });
            $video.bind('play', function() {
                $video.play();
            });
            $video.bind('pause', function() {
                $video.pause();
            });
            $video.bind('toggleMute', function() {
                $video.toggleMute();
            });
            $video.bind('mute', function() {
                $video.mute();
            });
            $video.bind('unMute', function() {
                $video.unMute();
            });
            $video.bind('volumeUp', function() {
                $video.volumeUp();
            });
            $video.bind('volumeDown', function() {
                $video.volumeDown();
            });
            $video.bind('forward', function() {
                $video.forward();
            });
            $video.bind('rewind', function() {
                $video.rewind();
            });
            $video.bind('replay', function() {
                $video.replay();
            });
            $video.bind('update', function() { // initializing and revising the player
                $video.update();
            });

            // control methods

            // Function fired when the play/pause button is hit
            $video.togglePlay = function() {
                if ($play.hasClass('playing')) {
                    $video.trigger('pause');
                } else {
                    $video.trigger('play');
                }
                return false;
            };
            // Play the video
            $video.play = function() {
                player.playVideo();
                $play.removeClass('paused').addClass('playing').attr('title', 'Pause');
            };
            // Pause the video
            $video.pause = function() {
                player.pauseVideo();
                $play.removeClass('playing').addClass('paused').attr('title', 'Play');
            };
            // Function fired when the mute/unmute button is hit
            $video.toggleMute = function() {
                if ($mute.hasClass('muted')) {
                    $video.trigger('unMute');
                } else {
                    $video.trigger('mute');
                }
                return false;
            };
            // Mute the video
            $video.mute = function() {
                player.mute();
                $mute.addClass('muted').attr('title', 'Un-Mute');
            };
            // Unmute the video
            $video.unMute = function() {
                player.unMute();
                $mute.removeClass('muted').attr('title', 'Mute');
            };
            // Advance the video forward
            $video.forward = function() {
                var dur = player.getDuration();
                if (dur > 0) {
                    var nt = Math.floor(dur * .1) + player.getCurrentTime();
                    if (nt < dur) {
                        player.seekTo(nt);
                    } else {
                        player.seekTo(dur);
                    }
                }
            };
            // Rewind the video
            $video.rewind = function() {
                var dur = player.getDuration();
                if (dur > 0) {
                    var nt = player.getCurrentTime() - Math.floor(dur * .1);
                    if (nt > 0) {
                        player.seekTo(nt);
                    } else {
                        player.seekTo(0);
                    }
                }
            };
            // Increase the video volume in increments of 20%
            $video.volumeUp = function() {
                var vol = player.getVolume();
                var nvol = "0";
                if (vol >= 0) {
                    nvol = "20"
                } if (vol >= 20) {
                    nvol = "40"
                } if (vol >= 40) {
                    nvol = "60"
                } if (vol >= 60) {
                    nvol = "80"
                } if (vol >= 80) {
                    nvol = "100"
                }
                player.setVolume(nvol);
            };
            // Decrease the video volume in increments of 20%
            $video.volumeDown = function() {
                var vol = player.getVolume();
                var nvol = "0";
                if (vol <= 100) {
                    nvol = "80"
                } if (vol <= 80) {
                    nvol = "60"
                } if (vol <= 60) {
                    nvol = "40"
                } if (vol <= 40) {
                    nvol = "20"
                } if (vol <= 20) {
                    nvol = "0"
                }
                player.setVolume(nvol);
            };
            // Restart the video from the beginning
            $video.replay = function() {
                player.seekTo(0);
                $video.play()
            };
            // Update the video status
            $video.update = function() {
                if (player && player.getDuration) {
                    if (player.getPlayerState() === 1) {
                        $video.play();
                    } else if (player.getPlayerState() === 0) {
                        $video.pause();
                    }
                }
            };

            // the YouTube movie calls this method when it loads
            // DO NOT CHANGE THIS METHOD'S NAME
            onYouTubePlayerReady = function(videoId) {
                var $videoRef = $(document.getElementById(videoId)).parent();
                setInterval(function() {
                    $videoRef.trigger('update');
                }, 250);
                $videoRef.trigger('cue');
            };

            // Init method
            $video.init = function() {
                var videoURL = config.useHTTPS ? 'https://www.' : 'http://www.';
                videoURL += config.protectPrivacy ? 'youtube-nocookie.com' : 'youtube.com'; 
            	videoURL +=  '/v/' + ytVideoId + '?&enablejsapi=1&playerapiid=' + videoId + '&rel=0&disablekb=1&cc_load_policy=1';
                // the embed!
                swfobject.embedSWF(
                    videoURL,
                    videoId,
                    config.videoWidth,
                    config.videoHeight,
                    '8',
                    null,
                    null,
                    config.params,
                    { id: videoId },
                    function() { player = document.getElementById(videoId); }
                );

                $video.addControls();
            };

            $video.addControls = function() {
                var videoTxt = ' <span class="invisible">'+linkText+'</span> ';
                // Play
            	$controls.append('<li><a href="" class="play" title="Play video">Play'+videoTxt+'</a></li>');
            	$play = $('.play', $controls);
            	$play.click(function(){
            		$video.trigger('play');
            		return false;
            	});
            	if (config.showVideoNav) {
                    // Forward
            		$controls.append('<li><a href="" class="forward" title="Fast forward video by 10%">Forward'+videoTxt+'</a></li>');
	                $forward = $('.forward', $controls);
	                $forward.click(function(){
	                    $video.trigger('forward');
	                    return false;
	                });
	                
	                // Rewind
	                $controls.append('<li><a href="" class="rewind" title="Rewind video by 10%">Rewind'+videoTxt+'</a></li>');
	                $rewind = $('.rewind', $controls);
	                $rewind.click(function(){
	                    $video.trigger('rewind');
	                    return false;
	                });
            	}
                // Pause/Stop
            	if (config.showPause) {
	                $controls.append('<li><a href="" class="pause" title="Pause video">Pause'+videoTxt+'</a></li>');
	                $pause = $('.pause', $controls);
	                $pause.click(function(){
	                    $video.trigger('pause');
	                    return false;
	                });
            	}
            	if (config.showVolume) {
                    // Volume Up
	                $controls.append('<li><a href="" class="volume up" title="Volume Up by 20%">Volume Up</a></li>');
	                $volumeUp = $('.volume.up', $controls);
	                $volumeUp.click(function(){
	                    $video.trigger('volumeUp');
	                    return false;
	                });
	                
	                // Volume Down
	                $controls.append('<li><a href="" class="volume down" title="Volume Down by 20%">Volume Down</a></li>');
	                $volumeDown = $('.volume.down', $controls);
	                $volumeDown.click(function(){
	                    $video.trigger('volumeDown');
	                    return false;
	                });
            	}
                // Mute
            	if (config.showMute) {
	                $controls.append('<li><a href="" class="mute" title="Mute video">Mute'+videoTxt+'</a></li>');
	                $mute = $('.mute', $controls);
	                $mute.click(function(){
	                    $video.trigger('toggleMute');
	                    return false;
	                });
            	}
                // Replay
            	if (config.showReplay) {
	                $controls.append('<li><a href="" class="replay" title="Play the video again from the start">Replay'+videoTxt+'</a></li>');
	                $replay = $('.replay', $controls);
	                $replay.click(function(){
	                    $video.trigger('replay');
	                    return false;
	                });
            	}
            };
            $video.init();		
        });
	};
})(jQuery);