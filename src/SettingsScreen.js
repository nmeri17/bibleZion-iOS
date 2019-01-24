import React, {Component} from 'react';

import {Platform, StyleSheet, Text, View, TextInput, Button, TimePickerAndroid, Modal, Picker,

	TouchableOpacity, SectionList, TouchableHighlight} from 'react-native';

import {DBProps,} from './app-wide-styling';

import TimePicker from 'react-native-timepicker';

import store from 'react-native-simple-store';

import Icon from 'react-native-vector-icons/Ionicons';

import Toast from 'rn-toaster';

import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import GDrive from "react-native-google-drive-api-wrapper";

import RNAlarm from 'react-native-alarm';


export default class SettingsScreen extends React.Component {

	constructor (props) {
		super(props);

		var {navigation: {state: {params}}} = props;

		this.state = { selectedTheme: 0, selectedSize: 0, contentHeader: params.contentHeader,

			// read component styling from here instead since its altered after component mount
			globalStyles: params.bodyStyles, alarmContext: null, gbDisable: false, userInfo: {}
		};
	}

	  static defaultProps = {

		themeOptions: [ {name: 'White on blue', fg: '#fff', bg: '#195ea1'}, {name: 'Red on white', fg: '#e01', bg: '#fff'},
			{name: 'Brown on black', fg: '#A5887E', bg: '#000'}
		],

		sizeOptions: [ {name: 'Large', value: 30}, {name: 'Normal', value: 20}, {name: 'Small', value: 15}],

		alarmOutput: Platform.select({
			ios: (predefH, predefM, alCtx) => <TimePicker
				
				selectedHour={predefH} selectedMinute={predefM} minuteInterval={5}

				onValueChange={ (hour,minute) => this.alarmDbAlter(hour,minute, null, alCtx)} />,

			android: async function (predefH, predefM, alCtx) {
				var {action, minute, hour} = await TimePickerAndroid.open({ hour: predefH, minute: predefM, is24Hour: true});
      
				if (action === TimePickerAndroid.timeSetAction) this.alarmDbAlter(hour, minute, null, alCtx);
			}
		}),

		headerOptions: [

			{backgroundColor: '#195ea1', color: '#18e9af'},

			{backgroundColor: '#eee', color: '#e01', paddingVertical:6, paddingHorizontal: 10},

			{backgroundColor: '#000', color: '#8a4e39'}
		],

		alarmNames: ['morning', 'afternoon', 'evening'],
	}

	static navigationOptions = ({ navigation }) => {

		var newParams = {};

		Object.assign(newParams, navigation.state.params.titleBar, {headerRight: null});

	    return newParams;
	};

	componentDidMount() {
		var that = this;

		DBProps(({misc: {alarms: {morning, afternoon, evening}}}) =>{

			that.setState({morningAlarm: morning, afternoonAlarm: afternoon, eveningAlarm: evening},

				() => that.getUpdatedProps()
			)
		});
	}

    componentDidUpdate(prevProps, prevState) {
  		var {navigation: {state: {params}}} = prevProps;

  		params.dbRefresh(); // bubble latest changes to menu component
    }

	render () {

		var {globalStyles, contentHeader, morningAlarm, afternoonAlarm, eveningAlarm, /*selectedTheme, */selectedSize, alarmTime, gbDisable, userInfo} = this.state,

		{/*themeOptions,*/ alarmOutput, alarmNames} = this.props, catContainer = {flexDirection: 'row', flexWrap: 'wrap'},

		catStyles = {color: globalStyles.color, width: '100%'},

		alarmTempl = alObj => {

			if (alObj !== void(0)) {
				var cap = alObj.name.substr(0,1).toUpperCase(), rest = alObj.name.substr(1);

				return (<View style={[catContainer, {justifyContent: 'space-between',flex:1, marginBottom:15}]}>

					<View style={{flex: 5}}>
						<TouchableOpacity onPress={() =>(alarmOutput.bind(this))(...alObj.alarmTime.split(':').map(parseInt), alObj.index)}
							style={{flex:2, marginBottom:15}}
						>
							<Text style={[catStyles, { left: 5}]}>{cap + rest} Reminder</Text>
						</TouchableOpacity>

						<Text style={[{flex:1, opacity: .5, left: 5}, catStyles]}>

							{	alObj.alarmTime.split(':')

								.map(x => x.length < 2 ? 0+x: x)

								.join(':')
							}
						</Text>
					</View>

					<TouchableOpacity onPress={() => alObj.alarmActive ? this.alarmToggleHandler(alObj.index) : false}

	    			style={[
	    				{ backgroundColor: globalStyles.color, top: 20, borderRadius: 50, width: 35, height:35, paddingLeft: 7, paddingVertical: 5},

	    				] }>
	    			<Icon name={Platform.select({ios:'ios-timer', android: 'md-timer'})} style={{color: !alObj.alarmActive ? '#666': globalStyles.backgroundColor}}

	    				size={25} />
	    		</TouchableOpacity>
				</View>)
			}
		},

		alarmData = [morningAlarm, afternoonAlarm, eveningAlarm].map((pv, h) => {
			if (pv) {
				pv.name = alarmNames[h]; pv.index = h;

				return pv;
			}
		}),

		themeSection = [
			/*(
				<View style={catContainer}>
					<Text style={[catStyles, { left: 5}]}>Skin</Text>
					<Picker mode='dropdown' selectedValue={selectedTheme}
						onValueChange = {(itemValue, itemIndex) => this.saveSettings(itemValue, itemIndex,'theme')}
						style={catStyles}
					>
						{themeOptions.map((obj,i) => <Picker.Item label={obj.name} value={i} key={'ts'+i} style={styles.pickerItem} size={30} />)}
					</Picker>
				</View>
			),
			*/(
				<View style={[catContainer]}>
					<Text style={[catStyles, { left: 5}]}>Text size</Text>
					
					<Picker mode='dropdown' selectedValue={selectedSize}
						onValueChange = {(itemValue, itemIndex) => this.saveSettings(itemValue, itemIndex,'size')}
						style={catStyles}
					>
						{this.props.sizeOptions.map((obj,i) =>

							<Picker.Item label={obj.name} value={obj.value} key={'ss'+i} style={styles.pickerItem} />
						)}
					</Picker>
				</View>
			)
		],
		externalSection = [
			...alarmData.map( alarmTempl),
			(
				<View style={catContainer}>
					<Text style={[catStyles, { left: 5, marginVertical: 15}]}>Synchronize</Text>
					
					<GoogleSigninButton size={GoogleSigninButton.Size.Icon} onPress={() => this.gSignIn()}
    				
	    				color={GoogleSigninButton.Color.Dark} disabled={gbDisable}
	    				
	    				style={{ width: 48, height: 48, marginBottom: 50 }} 
	    			/>

					<View style={[
	    				{borderRadius: 0, height: 38, color: userInfo ? '#666': globalStyles.backgroundColor, paddingHorizontal: 20,

	    				backgroundColor: '#fff', marginTop: 5, left: -8, flexDirection: 'row', flexWrap: 'nowrap',marginHorizontal: 5, paddingVertical: 10},

	    				] }>

	    				<Icon name={Platform.select({ios:'ios-cloud-upload', android: 'md-cloud-upload'})} size={20} />
	    				<Text> Google Drive</Text>
	    			</View>
				</View>
			),
		];

		return (
			<View style={{flex:1, paddingVertical: 30, paddingHorizontal:10, backgroundColor: globalStyles.backgroundColor}}>
				<SectionList
					renderItem={({item, index, separators}) => (
   						
   						<TouchableHighlight onShowUnderlay={separators.highlight} onHideUnderlay={separators.unhighlight}>
   							
   							<View style={[globalStyles, styles.rows]}>{item}</View>
   						</TouchableHighlight>
   					)}
  
  					renderSectionHeader={({section: {title}}) => 
  						<Text style={[contentHeader, {marginVertical:10}]}>{title}</Text>
  					}
					
					/*ItemSeparatorComponent={() => <View style={{ height: 1, flex: 1, backgroundColor: "#99a" }}/>
    
					}*/

  					sections={[
						{title: 'Appearance', data: themeSection},
						{title: 'External', data: externalSection},
					]}

					keyExtractor={(item, index) => 'settings:' + index}
				/>
 
		        <Toast ref={component => (this._toast = component)} style={styles.toast}></Toast>
			</View>
		);
	}

	saveSettings (itemValue, itemIndex,mode) {

		var { fontSize: prevSize, backgroundColor: prevBg, color: prevFg } = this.state.globalStyles,

		size = mode == 'size' ? this.props.sizeOptions[itemIndex].value : prevSize,

		themeObj = mode == 'theme' ? this.props.themeOptions[itemIndex] : {bg: prevBg, fg: prevFg};

		store.save('colorScheme', themeObj).then( () => {
			
			// save for scalar values
			store.save('size', size).then( () => {
				var {bg, fg} = themeObj;

				this.setState({ globalStyles: { fontSize: size, backgroundColor: bg, color: fg },},

				() =>this.getUpdatedProps())
			})
		}).catch(e => console.error(e));
	}

	alarmDbAlter(hour, min, inactive, alCtx) {
		var time = `${hour}:${min}`, bool = !inactive, // if undefined or null, enable alarm

		ctx = this.props.alarmNames[alCtx]+'Alarm', that = this;

		// capture datepicker input and store that as time
		store.save(ctx,

			{'alarmTime': time, 'alarmActive': bool, 'alarmId': that.state[ctx].alarmId})
		.then( () => {

			that.alarmAuthorized({time:time, bool:bool, ind: alCtx})
		})

		.catch(err => that.postAlarmAction(err))
	}

	postAlarmAction (err) {
		var that = this;

		that._toast.show({
			position: Toast.constants.gravity.top,
  			duration: 50,
			children: err,
			animationEnd: () => {
				that._toast._toastAnimationToggle = setTimeout(() => {
					that._toast.hide({
					duration: 1,
						animationEnd: () => { /* do something, anything! */ }
					});
				}, 3000);
			}
		});
	}

	alarmToggleHandler (alCtx) {
		var {alarmNames} = this.props, ctx = alarmNames[alCtx]+'Alarm',

		[hour, mins] = this.state[ctx].alarmTime.split(':');

		this.alarmDbAlter(hour, mins,1,alCtx); // disable alarm
	}

	async getUpdatedProps () {
 
		var {themeOptions, sizeOptions, headerOptions, navigation} = this.props, {globalStyles, titleBar, contentHeader} = this.state,

		{backgroundColor,color, fontSize} = globalStyles,

		selectedTheme = themeOptions.findIndex(({bg,fg}) => bg==backgroundColor && fg==color),

		// NOTE: scalar values here so the picker is holding actual values rather than indexes
		selectedSize = sizeOptions.find(({value}) => {
			return fontSize==value
		}),

		headerTheme = headerOptions.find(({backgroundColor:backgroundColorNew, color:colorNew}) =>
			backgroundColorNew==backgroundColor || colorNew==color
		);

		selectedSize = selectedSize !== void(4) ? selectedSize.value: selectedSize;

		this.setState({selectedTheme: selectedTheme, selectedSize: selectedSize,

			contentHeader: headerTheme
		});
	}

	alarmAuthorized ({time, bool, ind}) {
		var that = this, {alarmNames} = this.props, ctx = alarmNames[ind],

		// 2:10 to 02:10
		timeFormat = time.split(':').map(x => x.length < 2 ? 0+x: x),

		updState = msg => {

			var l = {};

			l[ ctx+'Alarm'] = {
				alarmTime: timeFormat.join(':'),

				alarmActive: bool,

				alarmId: ind
			};
			
			l.alarmContext= ind;

			that.setState(l, () => that.postAlarmAction(msg))
		};

		if (bool) {

			var evtId = 'activate-memo'+ind, titleStr  = 'EMAW BVM ' + ctx + ' alarm',

			startDate = new Date(new Date().setHours(...timeFormat)), h = new Date(),

			desc = 'Have you memorized a verse this ' + ctx+'?';
			

			RNAlarm.setAlarm((startDate.getTime()+''), //millisecond since epoch, x is the additional time since current date time in millisecond
				titleStr, //y is title to show in the notification
				evtId, //isRetry, nullable 
				'', //for android put the mp3 in raw directories project_name/android/app/src/main/res/raw. fileName is the name of the file without the .mp3 extension
				() => updState('Added reminder'),// Success callback function
				
				(r) => updState("Alarm not set. We're past " + ctx) // Fail callback function
			);
		}

		// remove event
		else {

			RNAlarm.clearAlarm();

			// reset others that were preset if any
			var reset = alarmNames
			
			.filter((s,d) => d != ind && that.state[s+'Alarm'].alarmActive)

			.map(n => that.state[n+'Alarm']);

			if (reset.length) reset.forEach(z => that.alarmAuthorized({time: z.alarmTime, bool: z.alarmActive, ind:z.alarmId}))
			
			updState('Removed reminder');
		}
	}

	gSignIn () {

		this.setState({ gbDisable: true }, async () => {

			var userInfo;

			GoogleSignin.configure({
			  scopes: ['https://www.googleapis.com/auth/drive.file'],
			  webClientId: '728356249338-b3elthn9c5eh6jbflu97ih85rdiqmhe6.apps.googleusercontent.com', // client ID of type WEB (needed to verify user ID and offline access)
			  offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER even if their device is turned off
			  hostedDomain: '', // specifies a hosted domain restriction
			  forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login
			});

			const isSignedIn = await GoogleSignin.isSignedIn();

			if (!isSignedIn || !userInfo) try {

		    	await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

			    userInfo = await GoogleSignin.signIn();
			}

		    catch (error) {
		    	this.postAlarmAction(error.message);

				this.setState({ gbDisable: false });
			}

		    GDrive.setAccessToken(userInfo.accessToken);

		    GDrive.init();

		    store.get('AllFolders').then(function (arr) {

			    GDrive.files.safeCreateFolder({
					
					name: 'EMAW BVM Synced Files', parents: ["root"]
				}).then(parentId => {
						arr.forEach(r => GDrive.files.safeCreateFolder({
					
							name: r.folderName, parents: [parentId]
						}).then(folderId => r.verses.forEach(vr =>{

							GDrive.files.createFileMultipart(
								vr.text,
								"text/plain",
								{ name: vr.quotation, parents: [folderId]}
							).then(httpsRes => console.log(httpsRes)).catch(f => console.error(f))
						}))
					)
				})
			})
			.then(() => {
				this.setState({ gbDisable: false, userInfo: userInfo });
				
				this.postAlarmAction('Synchronization Success!');
			})
		});
	}
}

const styles = StyleSheet.create({
	toast: {
		height: 30,
		marginTop: 180,
	},
	rows: {
		flex: 1,
		flexDirection: 'row',
	},
	pickerItem: {
		left: 0,
		maxHeight: 35,
	},
});
