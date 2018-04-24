/** 
 * Check on iOS platform
*/
function H5siOS() {

  var iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ];

  if (!!navigator.platform) {
    while (iDevices.length) {
      if (navigator.platform === iDevices.pop()){ return true; }
    }
  }

  return false;
}

/** 
 *=================H5Player Create
 *
 */
 
function H5sPlayerCreate(conf) {
	var player;

	if (H5siOS())
	{
		player = new H5sPlayerHls(conf);
	}else
	{
		player = new H5sPlayerWS(conf);
	}
	return player;
}

 
/** 
 *=================H5Player Delete
 *
 */
function H5sPlayerDelete(player) {
	delete player;
	
	return true;
}
 

