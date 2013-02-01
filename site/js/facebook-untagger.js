(function() {

	function fbConnectButton_clickHandler( event )
	{
		console.log( 'facebook-untagger::fbConnectButton_clickHandler(', event, ')' );
		$( FacebookManager.getUser() ).bind( 'change', user_changeHandler );
		$( FacebookManager.getUser() ).bind( 'error', user_errorHandler );
		FacebookManager.fetchUserInfos();
	}

	function user_changeHandler( event, options )
	{
		console.log( 'facebook-untagger::user_changeHandler(', options.changes, ')' );

		if( $.inArray(  'userInfos', options.changes ) != -1  )
		{
			FacebookManager.fetchUserPhotosTagIn();
		}
		else if( $.inArray( 'photosTagIn', options.changes ) != -1  )
		{
			console.log( 'facebook-untagger::user_changeHandler() photosTagIn', options.user );

		}
	}

	function user_errorHandler( event, options )
	{
		console.log( 'facebook-untagger::user_errorHandler(', event, options, ')' );
	}

	$(document).ready(function() {

		FacebookManager.initialize({
			appId      : '489426617765850'/*,
			channelUrl : '//www.emiliedewintre.fr/channel.html'*/
		}, [
			'user_photos'/*,
			'user_photo_video_tags',
			'publish_stream'*/
		], true);

		$( '#fbConnectButton' ).bind( 'click', fbConnectButton_clickHandler );
    });

}).call(this);