var FTrottler= function( latency, func ){
	var timer= 0
    return function(){
    	if( timer ) timer= clearTimeout( timer )
    	timer= setTimeout( func, latency )
    }
}
