var FLazy= function( gen ){
	var value= function(){
		value= gen()
		return value.apply( this, arguments )
	}
	return function(){
		return value.apply( this. arguments )
	}
}
