import React, {Component} from 'react';

import {StyleSheet, TextInput, TouchableOpacity, FlatList, View, Text, TouchableHighlight, Platform, } from 'react-native';

import Toast from 'rn-toaster';

import store from 'react-native-simple-store';

import Icon from 'react-native-vector-icons/Ionicons';

import ExemptScreenIcon from './exemptScreenIcon';


export default class SaveScreen extends React.Component {

	constructor (props) {
		super(props);

		var {navigation: {state: {params}}} = props;

		this.state = { allFolders: [], selectedFolder: null, globalStyles: params.bodyStyles};
	}

	static navigationOptions = ({ navigation }) => {

		var {state: {params: {titleBar}}} = navigation,

		currHR = ExemptScreenIcon({navigation,titleBar, nextIconExemptIndex: 0});

		return Object.assign( titleBar, {headerRight: currHR });
	  };

	componentDidMount() {
		var that = this, {selectedFolder, allFolders} = that.state;

		store.get('AllFolders').then(arr => {

			if (arr) allFolders.push(...arr);

			that.setState({allFolders: allFolders});			
		});
	}

    componentWillReceiveProps(nextProps) {
  		var {navigation: {state: {params}}} = nextProps;
		
		this.setState({globalStyles: params.bodyStyles});
    }

	render() {
		var {allFolders, globalStyles: {color, backgroundColor}, selectedFolder} = this.state, {contentHeader} = this.props.navigation.state.params,

		foldersComponent = <View style={{ paddingHorizontal: 10}}>

			<Text style={[contentHeader, {marginVertical:10}]}>Select a folder</Text>

			{allFolders.length ?
				<FlatList
	    			data={allFolders} key='fldrSel' numColumns={3} initialNumToRender={10}

	    			renderItem={({item: {folderName}, index, separators}) => <View key={'folderNames'+index} style={styles.dataColumn}>
			        	<Icon
				    		name={Platform.select({ios:'ios-folder', android: 'md-folder'})} style={[{fontSize: 80, color: folderName !== selectedFolder ? color: '#222'}]}

				    		onPress={() => this.selectAFolder(folderName)}
			        	/>
			        	<Text style={{ color}}>{folderName}</Text>
			        </View>}

	    			keyExtractor={(item, index) => 'folderView:'+index} extraData={{selectedFolder}}
	    		/>
	    	:
	    		<Text style={{color: color}}>No folders</Text>
	    	}
    	</View>,

		saveCriteria = [// represents fields that make up a new folder
    		<TextInput ref='quotation' placeholder='Chapter & Verse' underlineColorAndroid={color}

    			style={{color: color}} autoCapitalize='sentences' autoCorrect={true}

    			placeholderTextColor={color} />,

    		<TextInput ref='text' placeholder='Verse text' underlineColorAndroid={color} multiline={true}

    			style={{color: color}} autoCapitalize='sentences' autoCorrect={true}

    			placeholderTextColor={color} />, 

    		foldersComponent,

    		<TouchableOpacity onPress={() => allowSave() ? this.createNew() : false}

    			style={[{ backgroundColor: color/*, maxWidth: 50*/}, styles.saveButton] }>
    			<Text style={{color:backgroundColor, textAlign: 'center'}}>Save</Text>
    		</TouchableOpacity>
		],

		mainStyles = {flex:1, paddingVertical: 5, paddingHorizontal:3, backgroundColor,
			flexDirection: 'row', flexWrap: 'wrap'
		},

		allowSave = () => Object.keys(this.refs).every(r => this.refs[r]._lastNativeText !== void(0))

			&& this.state.selectedFolder !== null;

	    return (
	    	<View style={mainStyles}>

	    		<FlatList
	    			data={saveCriteria} extraData={saveCriteria}

	    			renderItem={({item, index, separators}) => <View style={{color, backgroundColor}}>{item}</View>}

	    			keyExtractor={(item, index) => 'saveItems:'+index} />
 
		        <Toast ref={component => (this._toast = component)} style={[styles.toast, {backgroundColor: contentHeader.backgroundColor}]}></Toast>
	    	</View>
	    );
	}

	createNew () {

		var propObj = {};

		for (var key in this.refs) propObj[key] = this.refs[key]._lastNativeText.trim();

		propObj.newFolderSelect = this.state.selectedFolder;

		// remove picker init
		var allFolders = this.state.allFolders, that = this;

		var toast = +Object.keys(propObj).every(y => propObj[y].length > 1),

		targetFolder = allFolders.findIndex(obj => {
			return obj.folderName == propObj.newFolderSelect;
		}),

		{navigation: {state: {params}}} = this.props;

		var saveIn = allFolders[targetFolder];

		if (saveIn !== void(0)) {

			saveIn.verses.push(propObj);

			if (toast) store.save('AllFolders', allFolders).then(() => that.saveRequest(() => {
					
					var data = saveIn.verses;
		
					// deep link to created view
					that.props.navigation.navigate('FinalScreen', {itemIndx: data.length-1,

						bodyStyles: that.state.globalStyles, titleBar: params.titleBar,

						target: data, contentHeader: params.contentHeader} );
				}, toast)
			);

			else this.saveRequest(() => console.log(propObj), toast);
		}
	}

	selectAFolder (selectedFolder) {
		this.setState({selectedFolder});
	}

	// just for toasts
	saveRequest (onComplete, ind) {
		var toastMsg = ['Please fill in all fields', 'Save successful'], ctx = this;

		ctx._toast.show({
			position: Toast.constants.gravity.top,
  			duration: 50,
			children: toastMsg[ind],
			animationEnd: () => {
				if (ctx._toast !== null) ctx._toast._toastAnimationToggle = setTimeout(() => {
					ctx._toast.hide({
						duration: 1,
						animationEnd: () => onComplete()
					});
				}, 500);
			},
		})
	}
}

const styles = StyleSheet.create({
  toast: {
  	height: 30,
  	marginTop: 180,
  },
  saveButton: {
	  	marginHorizontal: 5,
	  	marginTop: 30,
	  	paddingVertical: 10,
	  	paddingLeft: 10,
	  	borderRadius: 5,
  }
});