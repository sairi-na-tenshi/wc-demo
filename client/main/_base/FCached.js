var FCached= function( func ){
	var cache= {}
	return function( arg ){
		key= 'cache:' + arg
		if( key in cache ) return cache[ key ]
		return cache[ key ]= func.apply( this, arguments )
	}
}
