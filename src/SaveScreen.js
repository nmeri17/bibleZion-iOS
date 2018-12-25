import React, {Component} from 'react';

import {StyleSheet, TextInput, TouchableOpacity, FlatList, View, Picker, Text, TouchableHighlight, } from 'react-native';

import Toast from 'rn-toaster';

import store from 'react-native-simple-store';


export default class SaveScreen extends React.Component {

	constructor (props) {
		super(props);

		var {navigation: {state: {params}}} = props;

		this.state = { allFolders: [{folderName: ''}], selectedFolder: 'select a folder', globalStyles: params.bodyStyles};
	}

	static navigationOptions = ({ navigation }) => {
	    return navigation.state.params.titleBar;
	  };

	componentDidMount() {
		var that = this, {selectedFolder, allFolders} = that.state;

		store.get('AllFolders').then(arr => {

			if (!arr || !arr.length) allFolders[0].folderName = 'no folders';

			else {
				allFolders[0].folderName = selectedFolder;

				allFolders.push(...arr);
			}

			that.setState({allFolders: allFolders});			
		});
	}

    componentWillReceiveProps(nextProps) {
  		var {navigation: {state: {params}}} = nextProps;
		
		this.setState({globalStyles: params.bodyStyles});
    }

	render() {
		var {allFolders, globalStyles} = this.state,

		saveCriteria = [// represents fields that make up a new folder
    		<TextInput ref='quotation' placeholder='New Bible quotation' underlineColorAndroid='green' />,

    		<TextInput ref='text' placeholder='verse text' underlineColorAndroid='green' />, 

    		(<Picker key='fldrDrp' mode='dropdown' onValueChange={(val,i) => this.selectAFolder(val,i)}

				selectedValue={this.state.selectedFolder} enabled={allFolders.length !== 1}
			>
				{allFolders.map((obj,i) => <Picker.Item label={obj.folderName} value={obj.folderName} key={'pki'+i} />)}
			</Picker>),

    		<TouchableOpacity onPress={() => allowSave() ? this.createNew() : false}

    			style={[{ backgroundColor: globalStyles.color}, styles.saveButton] }>
    			<Text style={{color:globalStyles.backgroundColor}}>Save</Text>
    		</TouchableOpacity>
		],

		mainStyles = {flex:1, paddingVertical: 5, paddingHorizontal:3, backgroundColor: globalStyles.backgroundColor,
			flexDirection: 'row', flexWrap: 'wrap'
		},

		allowSave = () => !this.state.allFolders? true:false &&

			!Object.keys(this.refs).every(r => this.refs[r]._lastNativeText !== void(0) || this.state.selectedFolder);

	    return (
	    	<View style={mainStyles}>

	    		<FlatList
	    			data={saveCriteria}

					/*ItemSeparatorComponent={Platform.OS !== 'android' && ({highlighted}) => (
						<View style={[style.separator, highlighted && {marginLeft: 0}]} />
					)}*/

	    			renderItem={({item, index, separators}) => (
   						
   						<TouchableHighlight onShowUnderlay={separators.highlight} onHideUnderlay={separators.unhighlight}>
   							
   							<View style={globalStyles}>{item}</View>
   						</TouchableHighlight>
   					)}

	    			keyExtractor={(item, index) => 'saveItems:'+index} />
 
		        <Toast ref={component => (this._toast = component)} style={styles.toast}></Toast>
	    	</View>
	    );
	}

	createNew () {

		var propObj = {};

		for (var key in this.refs) {

			propObj[key] = this.refs[key]._lastNativeText.trim();

			if (propObj[key] == void(0)) propObj[key] = this.state.selectedFolder;
		}

		// remove picker init
		var allFolders = this.state.allFolders;

		allFolders.shift();

		var toast = +Object.keys(propObj).every(y => propObj[y].length > 5),

		targetFolder = allFolders.findIndex(obj => {
			return obj.folderName == propObj.newFolderSelect;
		}),

		{navigation: {state: {params}}} = this.props;

		allFolders[targetFolder].verses.push(propObj);

		if (toast) store.save('AllFolders', allFolders).then(() => this.saveRequest(() => {
				
				var data = allFolders[targetFolder].verses;
	
				// deep link to created view
				this.props.navigation.navigate('FinalScreen', {itemIndx: data.length-1,

					bodyStyles: this.state.globalStyles, titleBar: params.titleBar,

					target: data, contentHeader: params.contentHeader} );
			}, toast)
		);

		else this.saveRequest(() => console.log(propObj), toast);
	}

	selectAFolder (val,i) {
		this.setState({selectedFolder:val});
	}

	saveRequest (onComplete, ind) {
		var toastMsg = ['please fill in all fields', 'save successful'], ctx = this;

		ctx._toast.show({
			position: Toast.constants.gravity.top,
  			duration: 200,
			children: toastMsg[ind],
			animationEnd: () => {
				ctx._toast._toastAnimationToggle = setTimeout(() => {
					ctx._toast.hide({
						duration: 1,
						animationEnd: () => onComplete()
					});
				}, 3000);
			},
		})
	}
}

const styles = StyleSheet.create({
  toast: {
  	height: 30,
  	marginTop: 180,
  },
  hide: {
  	display: 'none',
  },
  folderPicker: {},
  saveButton: {
  	marginHorizontal: 5,
  	paddingVertical: 10,
  	paddingHorizontal: 5,
  	borderRadius: 5,
  }
});