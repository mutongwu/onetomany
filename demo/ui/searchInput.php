<?php ?>
<?php
$varName = null;
$queryKey = "who";
$json = "{";

if(array_key_exists( 'var',$_REQUEST)) {
	$varName = $_REQUEST['var'];
}
if(array_key_exists( 'key',$_REQUEST)) {
	$queryKey = $_REQUEST['key'];
}



if($queryKey == "yes"){
	$json = "{\"success\":1,\"data\":[";
	for ($i=0; $i<5; $i++) {
		$json .= "\"yes_".rand()."\"";
		if($i != 4){
			$json.= ",";
		}
	}
	$json.= "]}";
}else{
	$json = "{\"success\":1,\"data\":[]}";
}


if($varName != null){
	echo "var ".$varName."=".$json;
}else{
	echo $json;
}

