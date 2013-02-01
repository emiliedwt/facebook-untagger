(function() {

	var templateName;

	function FacebookManager_readyHandler( event )
	{
		console.log( 'facebook-untagger::FacebookManager_readyHandler(', arguments, ')' );
		templateName = 'tpl-connect';
		render();
	}

	function fbConnectButton_clickHandler( event )
	{
		console.log( 'facebook-untagger::fbConnectButton_clickHandler(', event, ')' );
		event.preventDefault();
		FacebookManager.fetchUserInfos();
		templateName = 'tpl-loading';
		render();
	}

	function untagButton_clickHandler( event )
	{
		console.log( 'facebook-untagger::fbConnectButton_clickHandler(', event, ')' );
		event.preventDefault();
		FacebookManager.deleteAllTags();
		templateName = 'tpl-loading';
		render();
	}

	function user_changeHandler( event, options )
	{
		console.log( 'facebook-untagger::user_changeHandler(', options.changes, ')' );

		if( $.inArray(  'userInfos', options.changes ) != -1  )
		{
			FacebookManager.fetchUserPhotosTagIn();
			templateName = 'tpl-loading';
		}
		else if( $.inArray( 'photosTagIn', options.changes ) != -1  )
		{
			console.log( 'facebook-untagger::user_changeHandler() photosTagIn', options.user );
			templateName = 'tpl-photosList';
		}

		render();
	}

	function user_errorHandler( event, options )
	{
		console.log( 'facebook-untagger::user_errorHandler(', event, options, ')' );
		templateName = 'tpl-error';
		render();
	}

	function render()
	{
		var user = FacebookManager.getUser();
		$( '#container' ).html( Mustache.render( $( '#' + templateName ).html(), user ) );

		$( '#fbConnectButton' ).bind( 'click', fbConnectButton_clickHandler );
		$( '#untagButton' ).bind( 'click', untagButton_clickHandler );
	}

	$(document).ready(function() {

		templateName = 'tpl-loading';

		FacebookManager.initialize({
			appId      : '489426617765850'/*,
			channelUrl : '//www.emiliedewintre.fr/channel.html'*/
		}, [
			'user_photos',
//			'user_photo_video_tags',
			'publish_stream'
		], true);

		$( FacebookManager ).bind( 'ready', FacebookManager_readyHandler );
		$( FacebookManager.getUser() ).bind( 'change', user_changeHandler );
		$( FacebookManager.getUser() ).bind( 'error', user_errorHandler );


		render();
    });

}).call(this);