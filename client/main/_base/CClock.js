var CClock= function( ){
	if( this instanceof CClock ) return
	var clock= new CClock

	var timerID= FProp()

	var active= FProp( false )
	clock.active= FPoly( active, function( val ){
		active( val )
		if( timerID() ) timerID( window.clearTimeout( timerID() ) )
		if( val ) timerID( window.setTimeout( proc(), latency() ) )
		return this
	})

	var latency= FProp( 0 )
	clock.latency= FPoly( latency, function( val ){
		latency( val )
		clock.active( active() )
		return this
	} )

	var proc= FProp()
	clock.proc= FPoly( proc, function( val ){
		proc( val )
		clock.active( active() )
		return this
	} )

	return clock
}
