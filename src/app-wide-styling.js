import React, {Component} from 'react';

import { Platform, } from 'react-native';

import store from 'react-native-simple-store';
    
// default appearance
var colorScheme = {bg: '#000', fg: '#A5887E'}, size = 20, callback,

// titleBar opts
fh = [{
	headerStyle: {
      backgroundColor: '#195ea1', // blue
    },
    headerTintColor: '#fff'/*,
    headerTitleStyle: {
      fontWeight: 'bold',
    }*/
  },
  {
	headerStyle: {
      backgroundColor: '#e01', // red
    },
    headerTintColor: '#fff'
	},
  {
	headerStyle: {
      backgroundColor: '#A5887E',
    },
    headerTintColor: '#333'
	}
],

// header styles
th = [
		{backgroundColor: '#195ea1', color: '#18e9af'},

		{backgroundColor: '#eee', color: '#e01', paddingVertical:6, paddingHorizontal: 10},

		{backgroundColor: '#000', color: '#8a4e39', fontWeight: '300'}
	],


getRelatedStyle = (appWideStyles, mode) => {
	var ctx = [fh, th][mode], res,

	fhCb = ({headerStyle: {backgroundColor}, headerTintColor}) =>

		appWideStyles.backgroundColor==backgroundColor || appWideStyles.color==backgroundColor,

	thCb = ({backgroundColor, color}) =>
		appWideStyles.backgroundColor==backgroundColor || appWideStyles.color==color,

	cbCtx = [fhCb, thCb][mode];

	res = ctx.find(cbCtx);

	if (res) return res;
}

data= {misc: 

		{alarms: {

			morning: {alarmId: 1, alarmTime: '08:30', alarmActive: false},

			afternoon: {alarmId: 2, alarmTime: '01:15', alarmActive: false},

			evening: {alarmId: 3, alarmTime: '07:30', alarmActive: false}}
		},

		appWideStyles: {},

		ready: false
	},

// this method accepts a callback of what to do with the styles once gotten from DB
o = (cb) => {
	
	// subsequent requests to this module shouldnt make another roundtrip
    if(data.ready !== false) {

    	cb(data); // set ready to false and make another request to trigger update
    }
    // callback is undefined only on init (sync) but by this assignment, the module can be called without an argument
    else {

    	callback = cb;

    	init();
    }
},

// initial values on app install
init = () => store.get('AllFolders').then(function (arr) {

	// on install
	if (arr === null) store.save('AllFolders', []);
	// folders schema: [{folderName: name, verses: [{quotation: '', text:''}]}]
})

.then(() => store.get('morningAlarm')).then(isset => {

	if (!isset) return store.save('morningAlarm', data.misc.alarms.morning);

	else data.misc.alarms.morning = isset;
})

.then(() => store.get('afternoonAlarm')).then(isset => {

	if (!isset) return store.save('afternoonAlarm', data.misc.alarms.afternoon);

	else data.misc.alarms.afternoon = isset;
})

.then(() => store.get('eveningAlarm')).then(isset => {

	if (!isset) return store.save('eveningAlarm', data.misc.alarms.evening);

	else data.misc.alarms.evening = isset;
})

.then(() => store.get('colorScheme')).then(isset => {

	if (!isset) return store.save('colorScheme', colorScheme);

	else colorScheme = isset;
})

.then(() => store.get('size')).then(isset => {

	if (!isset) return store.save('size', size);

	else size = isset;
})

.then(() => {
	// prepare data for callback
	var {bg, fg} = colorScheme;

	data.appWideStyles = { fontSize: parseInt(size), backgroundColor: bg, color: fg, fontWeight: '300'};

	data.ready = true;

	if( typeof callback == 'function' ) callback(data);
}),

AppScreens = [
	{name: 'Save verse', route:'SaveVerse',icon: Platform.select({ios:'ios-save', android:'md-save'})},

   	{name: 'Memorize', route:'MemorizeVerse',icon: Platform.select({ios:'ios-filing', android:'md-filing'})},

   	{name: 'Test yourself', route:'TestVerse',icon: Platform.select({ios:'ios-school', android:'md-school'})},

   	{name: 'Settings', route:'SettingsVerse',icon: Platform.select({ios:'ios-settings', android:'md-settings'})}
];


module.exports = {DBProps: o, RelatedStyle: getRelatedStyle, AppScreens, };