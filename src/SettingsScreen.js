import React, {Component} from 'react';

import {Platform, StyleSheet, Text, View, TextInput, Button, TimePickerAndroid, Modal, Picker,

	TouchableOpacity, SectionList, TouchableHighlight} from 'react-native';

import {DBProps,} from './app-wide-styling';

import TimePicker from 'react-native-timepicker';

import store from 'react-native-simple-store';

import RNCalendarEvents from 'react-native-calendar-events';

import Toast from 'rn-toaster';

import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import GDrive from "react-native-google-drive-api-wrapper";


export default class SettingsScreen extends React.Component {

	constructor (props) {
		super(props);

		var {navigation: {state: {params}}} = props;

		this.state = { selectedTheme: 0, selectedSize: 0, contentHeader: params.contentHeader

			// read component styling from here instead since its altered after component mount
			globalStyles: params.bodyStyles, alarmContext: null, isSigninInProgress: true
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

				onValueChange={ (hour,minute) => this.setAlarm(hour,minute, null, alCtx)} />,

			android: async function (predefH, predefM, alCtx) {
				var {action, minute, hour} = await TimePickerAndroid.open({ hour: predefH, minute: predefM, is24Hour: true});
      
				if (action === TimePickerAndroid.timeSetAction) this.setAlarm(hour, minute, null, alCtx);
			}
		}),

		headerOptions: [{backgroundColor: '#195ea1', color: '#18e9af'}, {backgroundColor: '#eee', color: '#e01',

			paddingVertical:6, paddingHorizontal: 10}],

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

			that.setState({{morningAlarm: morning, afternoonAlarm: afternoon, eveningAlarm: evening}},

				() => that.getUpdatedProps()
			)
		});
	}

    componentDidUpdate(prevProps, prevState) {
  		var {navigation: {state: {params}}} = prevProps;

  		params.dbRefresh(); // bubble latest changes to menu component
    }

	render () {

		var {globalStyles, contentHeader, morningAlarm, afternoonAlarm, eveningAlarm, /*selectedTheme, */selectedSize, alarmTime} = this.state,

		{/*themeOptions,*/ alarmOutput, alarmNames} = this.props, catContainer = {flexDirection: 'row', flexWrap: 'wrap'},

		catStyles = {color: globalStyles.color, width: '100%'},

		alarmTempl = alObj => {

			if (alObj) return 
				(<View style={[catContainer, {justifyContent: 'space-between',flex:1}]}>

					<View style={{flex: 5}}>
						<TouchableOpacity onPress={() =>(alarmOutput.bind(this))(alObj.alarmTime, alObj.index)}
							style={{flex:2, marginBottom:5}}
						>
							<Text style={[catStyles, { left: 5}]}>{alObj.name} Reminder</Text>
						</TouchableOpacity>

						<Text style={[{flex:1, opacity: .5, left: 5}, catStyles]}>{alObj.alarmTime}</Text>
					</View>

					<Button title='cancel' disabled={!alObj.alarmActive} onPress={() => this.alarmToggleHandler(alObj.index)}
						style={{flex: 1}}/>
				</View>)
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
						{themeOptions.map((obj,i) => <Picker.Item label={obj.name} value={i} key={'ts'+i} style={styles.pickerItem} />)}
					</Picker>
				</View>
			),
			*/(
				<View style={catContainer}>
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
					<Text style={[catStyles, { left: 5}]}>Synchronize</Text>
					
					<GoogleSigninButton style={{ width: 48, height: 48 }} size={GoogleSigninButton.Size.Wide}
    				
	    				color={GoogleSigninButton.Color.Light} onPress={this.gSignIn}
	    				
	    				disabled={this.state.isSigninInProgress}
	    			/>
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
  
  					renderSectionHeader={({section: {title}}) => (
    			
    					<Text style={[contentHeader, {marginVertical:10}]}>{title}</Text>
  					)}
					
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

	setAlarm(hour, min, inactive, alCtx) {
		var time = `${hour}:${min}`, bool = !inactive, // if undefined or null, enable alarm

		that = this, ctx = this.props.alarmNames[alCtx];

		// capture datepicker input and store that as time
		store.save(ctx,

			{'alarmTime': time, 'alarmActive': bool, 'alarmId': that.state[ctx+'Alarm'].alarmId})
		.then( () =>
			RNCalendarEvents.authorizationStatus().then(status => {

				if (status != 'authorized' && Platform.OS == 'android') RNCalendarEvents.authorizeEventStore()

					.then(status => this.alarmAuthorized({status:status, time:time, bool:bool, ind: alCtx}))

					.catch(err => that.postAlarmAction(err));

				else this.alarmAuthorized({status:status, time:time, bool:bool, ind: alCtx});

			}).catch(err => that.postAlarmAction(err))
		);
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
		var [hour, mins] = this.state.alarmTime.split(':');

		this.setAlarm(hour, mins,1,alCtx); // disable alarm
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

		const isSignedIn = await GoogleSignin.isSignedIn();

		this.setState({selectedTheme: selectedTheme, selectedSize: selectedSize,

			contentHeader: headerTheme, isSigninInProgress: !isSignedIn
		});
	}

	alarmAuthorized ({status, time, bool, ind}) {

		if (status == 'authorized' || Platform.OS == 'ios') {

			var {alarmNames}= this.props, ctx = alarmNames[ind], evtId = 'activate-memo'+ind,

			titleStr  = 'EMAW BVM ' + ctx + 'alarm',

			// 2:10 to 02:10
			timeFormat = time.split(':').map(x => x.length < 2 ? 0+x: x), h = new Date();

			// create new calendar entry
			if (bool) return RNCalendarEvents.saveEvent(titleStr, {id: evtId,

				title: titleStr,

				recurrenceRule: {

					frequency : 'daily', occurrence: 1, interval: 2,

					endDate: new Date((h.getFullYear()+1) + '-' + (h.getMonth()+1) + '-' + h.getDate()).toISOString(),
				},

				startDate: new Date(new Date().setHours(...timeFormat)).toISOString(),

				description: 'Have you memorized a verse this ' + ctx+'?',

				alarms: [{
					date: 1 // relative offset from the start date
				}]
			})

			.then(id => {console.log(id)
				this.setState( {this.state[ctx+'Alarm']: {alarmTime: timeFormat.join(':'), alarmActive: bool, alarmId: ind}, alarmContext: ind},

				this.postAlarmAction('Added reminder'))
			});

			// remove event
			return RNCalendarEvents.removeEvent(evtId)

			.then(() => {
				var old = this.state[ctx+'Alarm']; Object.assign(old, {alarmActive: bool});

				this.setState( old, this.postAlarmAction('removed reminder'))});
		}
	}

	async gSignIn () {

		GoogleSignin.configure({
		  scopes: ['https://www.googleapis.com/auth/drive.file'],
		  webClientId: '102492523207563707116', // client ID of type WEB (needed to verify user ID and offline access)
		  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
		  hostedDomain: '', // specifies a hosted domain restriction
		  loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
		  forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login.
		  accountName: '', // [Android] specifies an account name on the device that should be used
		});

		try {
		    try {
		    	await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

			    this.setState({ isSigninInProgress: false });

			    const userInfo = await GoogleSignin.signIn();

			    this.postAlarmAction('Success! Synchronizing...');


			    GDrive.setAccessToken(userInfo.accessToken);

			    GDrive.init();

			    store.get('AllFolders').then(function (arr) {

				    arr.forEach(r => GDrive.files.safeCreateFolder({
						
							name: r.folderName, parents: ["root"]
						}).then(folderId => r.verses.forEach(vr =>

							GDrive.files.createFileMultipart(
								// use r.folderName if this doesnt work
								vr.text, ".txt", { name: vr.quotation, parents: ["root", folderId]
							 
							}))
						)
					)
				})
			}

		    catch (error) {
		    	this.postAlarmAction('Google play services are unavailable');

				this.setState({ isSigninInProgress: true });
			}
		}
		catch (error) {
				this.postAlarmAction(error.code);

				this.setState({ isSigninInProgress: true });
			}
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
		fontSize: 70,
		left: 0,
		maxHeight: 35
	}
});