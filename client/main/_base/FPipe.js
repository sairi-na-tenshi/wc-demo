FPipe= function( ){
	var list= arguments
	var len= list.length
	return function( data ){
		for( var i= 0; i < len; ++i ) data= list[ i ].call( this, data )
		return data
	}
}