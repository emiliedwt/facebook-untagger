/**
 * FacebookManager sert d'interface entre l'application et l'api Facebook
 * facilite le Facebook Connect et le partage Facebook
 * Plus d'infos ici => https://developers.facebook.com/docs/reference/javascript/

 * ATTENTION : Ne pas oublier d'ajouter la div : <div id="fb-root"></div> dans le layout.hp / base.html.twig
 */

 	var FacebookManager = {


		_initOptions: {},
		_scope: [],

		_user: {},
		_authResponse: undefined,

		_pictureFormatArray: [ 'square', 'small', 'normal', 'large' ],

		 /**
		 * @param  {Object} initOptions	options d'initialisation de Facebook, notamment l'appId qui est requis
		 * 								options possibles :
		 * 			 					{
		 * 									appId      : 'YOUR_APP_ID', // App ID from the App Dashboard
		 * 									channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File for x-domain communication
		 * 									status     : true, // check the login status upon init?
		 * 									cookie     : true, // set sessions cookies to allow your server to access the session?
		 * 									xfbml      : true  // parse XFBML tags on this page?
		 * 								}
		 */
		initialize : function( initOptions, scope, debug )
		{
			console.log( 'FacebookManager::initialize', this );
			this._initOptions = initOptions;
			this._scope = scope || this._scope;
			this._debug = debug;

			// redéfinition du scope des handlers
			this._sdk_successHandler = $.proxy( this._sdk_successHandler, this );
			this._login_completeHandler = $.proxy( this._login_completeHandler, this );
			this._fetchUserInfos_completeHandler = $.proxy( this._fetchUserInfos_completeHandler, this );
			this.fetchUserPhotosTagIn_successHandler = $.proxy( this.fetchUserPhotosTagIn_successHandler, this );
			this.fetchUserPhotosTagIn_errorHandler = $.proxy( this.fetchUserPhotosTagIn_errorHandler, this );

			// Lance l'initialisation après chargement du sdk
			window.fbAsyncInit = this._sdk_successHandler;
			this._loadSDK();
		},


		/**
		 * Chargement Asynchrone du Facebook js sdk
		 */
		_loadSDK : function()
		{
			console.log( 'FacebookManager::_loadSDK()', this._initOptions );
			var js, id = 'facebook-jssdk', ref = document.getElementsByTagName('script')[0];
			if (document.getElementById(id)) {return;}
			js = document.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/en_US/all" + (this._debug ? "/debug" : "") + ".js";
			ref.parentNode.insertBefore(js, ref);
		},

		_sdk_successHandler : function()
		{
			console.log( 'FacebookManager::_sdk_successHandler()', this._initOptions );
			// init the FB JS SDK
			FB.init( this._initOptions );
		},

		/**
		 * Récuppère les infos Facebook de l'utilisateur
		 * Par défaut, les infos récupérées sont : id, name, first_name, last_name, link, username, gender, locale
		 * @param  {array} scope	liste des permissions Facebook
		 *							On peut récuppérer d'autres infos grâce aux 'Extended Permissions'
		 *							=> http://developers.facebook.com/docs/reference/login/extended-permissions/
		 */
		fetchUserInfos: function()
		{
			console.log( 'FacebookManager::fetchUserInfos( scope )', this._scope );
			FB.login( this._login_completeHandler, { scope: this._scope.join(',') } );
		},

		/**
		 * Retourne les infos du user tel qu'elles sont récupérées de Facebook
		 * @return {Object} Objet contenant les infos
		 */
		getUser: function()
		{
			return this._user;
		},

		_login_completeHandler: function( response )
		{
			console.log( 'FacebookManager::_login_completeHandler(response)', response );
			var eventName;
			// Si l'utilisateur est connecté, on récupére ses infos
			if( response.status == 'connected' )
			{
				this._authResponse = response.authResponse;
				FB.api( '/me', this._fetchUserInfos_completeHandler )
			}
			else
			{
				$( this ).trigger( 'error', response );
			}
			$( this ).trigger( response.status, response );
		},

		_fetchUserInfos_completeHandler: function( response )
		{
			// response.profilePictureUrls =  this.getProfilePictureUrls( response.id );
			console.log( 'FacebookManager::_fetchUserInfos_completeHandler(response)', response );

			this._user = $.extend( this._user, response);

			var options = {
				changes: [ 'userInfos' ],
				user: this._user
			}
			$( this._user ).trigger( 'change', options );
		},

		/**
		 * Retourne la liste des urls pour l'image de profil dans les 4 formats de facebook
		 * => square, small, normal, large
		 * @return {Object} Objet contenant les urls
		 * 					{
								square	: 'http://graph.facebook.com/USER_ID/picture?type=square',
								small	: 'http://graph.facebook.com/USER_ID/picture?type=small',
								normal	: 'http://graph.facebook.com/USER_ID/picture?type=normal',
								large	: 'http://graph.facebook.com/USER_ID/picture?type=large'
							}
		 */
		getProfilePictureUrls: function( id )
		{
			var urls = {};
			for( var i = 0; i < this._pictureFormatArray.length; i++ )
			{
				urls[ this._pictureFormatArray[i] ] = this.getProfilePictureUrl( id, this._pictureFormatArray[i] )
			}
			return urls;
		},

		/**
		 * Retourne l'url de l'image de profil
		 * @param	{Number} 				id		id facebook du user
		 * @param	{Object} ou {String}	options	Liste des options
		 *											soit directement le type en string ( square, small, normal, large )
		 *											soit un objet avec les dimensions souhaitées
		 *											{
		 *												width: 200,
		 *												height: 150
		 * 											}
		 * @return 	{String} 				l'url de l'image
		 */
		getProfilePictureUrl: function( id, options )
		{
			// console.log( 'FacebookManager::getProfilePictureUrl(', id, options, ')' );
			var url = 'http://graph.facebook.com/' + id + '/picture';
			if( options && typeof( options ) === 'string' && $.inArray( options, this._pictureFormatArray ) != -1 )
			{
				url += '?type=' + options;
			}
			else if( options && options instanceof Object )
			{
				var queryStringArray = [];

				for( var option in options )
				{
					queryStringArray.push( option + '=' + options[ option ] );
				}
				url += '?' + queryStringArray.join( '&' );
			}
			return url;
		},

		/**
		 * Retourne la liste des urls pour l'image de profil dans les 4 formats de facebook
		 * => square, small, normal, large
		 * @return {Object} Objet contenant les urls
		 * 					{
								square	: 'http://graph.facebook.com/USER_ID/picture?type=square',
								small	: 'http://graph.facebook.com/USER_ID/picture?type=small',
								normal	: 'http://graph.facebook.com/USER_ID/picture?type=normal',
								large	: 'http://graph.facebook.com/USER_ID/picture?type=large'
							}
		 */
		fetchUserPhotosTagIn: function()
		{
			$.ajax({
				type: 'GET', // Le type de ma requete
				url: 'https://graph.facebook.com/' + this._user.id + '/photos?method=GET&format=json&access_token=' + this._authResponse.accessToken, // L'url vers laquelle la requete sera envoyee
				data: {},
				success: this.fetchUserPhotosTagIn_successHandler,
				error: this.fetchUserPhotosTagIn_errorHandler
			});
		},

		fetchUserPhotosTagIn_successHandler: function( data, textStatus, jqXHR )
		{
			console.log( 'FacebookManager::fetchUserPhotosTagIn_successHandler(', $.parseJSON( data ), ')', this );
			this._user.photosTagIn = $.parseJSON( data );
			var options = {
				changes: [ 'photosTagIn' ],
				user: this._user
			}
			$( this._user ).trigger( 'change', options );
		},

		fetchUserPhotosTagIn_errorHandler: function( jqXHR, textStatus, errorThrown )
		{
			// console.log( 'FacebookManager::fetchUserPhotosTagIn_errorHandler(', $.parseJSON(jqXHR.responseText).error, ')', this );
			$( this._user ).trigger( 'error', $.parseJSON(jqXHR.responseText).error );
		},

		/**
		 * Partage sur le mur Facebook du user
		 * Plus d'infos ici : https://developers.facebook.com/docs/reference/dialogs/feed/
		 * @param	{Object} 	options		liste des options du share
		 *									{
		 *										redirect_uri: 	'url de callback',
		 *										link: 			'url que l'on veut partager',
		 *										picture: 		'url de la photo', // ne marche pas en local
		 *										name: 			'Titre',
		 *										caption: 		'Sous-titre',
		 *										description: 	'Description'
		 *									}
		 * @param	{Function} 	callback	fonction de callback
		 */
		share: function( options, callback )
		{
			options = options || {};
			options.method = 'feed';

			callback = callback || function(){};
			console.log( 'FacebookManager::share', options, callback );
			FB.ui( options, callback );
		}
	};
