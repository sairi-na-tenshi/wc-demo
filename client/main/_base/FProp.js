var FProp= function( value ){
	return FPoly
	(   function(){
			return value
		}
	,	function( val ){
			value= val
			return this
		}
	)
}
