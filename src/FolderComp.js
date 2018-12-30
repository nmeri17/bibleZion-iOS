import React, {Component} from 'react';

import {StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, StatusBar, SafeAreaView, ScrollView} from 'react-native';

import Toast from 'rn-toaster';

import store from 'react-native-simple-store';


// component for displaying assorted components parsed and sourced at its caller's location
export default class FolderComp extends React.Component {

	constructor (props) {
		super(props);

		this.state = {
			popup: false, headerTitle: props.headerTitle, formattedComponents: props.formattedComponents,

			globalStyles: props.bodyStyles, contentHeader: props.contentHeader
		};
	}

	static navigationOptions = ({ navigation }) => {

		var newParams = {};

		Object.assign(newParams, navigation.state.params.titleBar, {headerRight: null});

	    return newParams;
	};

	// runs on update from the source/calling component
	componentWillReceiveProps({modalChild, formattedComponents}) {

		this.setState({popup: modalChild !== null, formattedComponents: formattedComponents});
	}

	// this precedes setState callback
	componentDidUpdate(prevProps, prevState) {

		this._toast._toastAnimationToggle = setTimeout(() => {
			// confirm there's a toast to suppress
			if (this._toast !== null) this._toast.hide({
				duration: 1,
				animationEnd: () => {/* post toast action goes here */ }
			});
		}, 500);
	}

	render () {

		// spaces between vars not in a Text component throw errors
		var {testTitle, modalChild} = this.props, {globalStyles} = this.state,

		{headerTitle, formattedComponents, popup, showTestButton, contentHeader} = this.state,

		foreigners = [ headerTitle, formattedComponents];

		return (

			<View style={ [{flex:1, paddingVertical: 5, paddingHorizontal:3}, globalStyles]}>
				
				{foreigners}
				
				<Modal
					animationType="slide" visible={popup} transparent={true}
					
					onRequestClose={() => this.closeModal()} ref='modalContainer'
				>
					
					{this.modalContents()[modalChild]}
		        </Modal>
 
		        <Toast ref={component => (this._toast = component)} style={styles.toast}></Toast>
			</View>
		);
	}

	closeModal (...val) {
		this.setState({popup: false}, () => {
		
			if (this.props.onChildModalClose !== null) {
	
				this.props.onChildModalClose(...val);// trigger close behaviour i.e. parent update
			}
		});
	}

	modalContents () {
		var {globalStyles, contentHeader} = this.state;

		return [
			<View style={styles.modalStyles}>
				<TextInput ref='newFolderInput' placeholder='Folder name' underlineColorAndroid='green' />

				<TouchableOpacity onPress={() => this.folderSave()}

	    			style={[{ backgroundColor: globalStyles.color}, styles.checkButton] }>
	    			<Text style={{color:globalStyles.backgroundColor}}>Create folder</Text>
	    		</TouchableOpacity>
			</View>,

			<View style={[styles.modalStyles, {marginTop: 150, minHeight: 150}]}>
				<Text style={{color: contentHeader.color, marginBottom: 20}}>Success! you remembered everything!</Text>
					
				<TouchableOpacity onPress={() => this.closeModal()}

	    			style={[{ backgroundColor: globalStyles.color}, styles.checkButton] }>
	    			
	    			<Text style={{color:globalStyles.backgroundColor}}>Test another verse</Text>

	    		</TouchableOpacity>
			</View>,
			
			<View style={[styles.modalStyles, {marginTop: 150, minHeight: 250}]}>
				<Text style={{color: contentHeader.color}}>Correct text</Text>
				<ScrollView>
					<View style={styles.testResults}>{this.props.noDiff}</View>
				</ScrollView>

				<Text style={{color: contentHeader.color}}>Your answer</Text>
				<ScrollView>
					<View style={styles.testResults}>{this.props.noDiff2}</View>
				</ScrollView>
					
				<TouchableOpacity onPress={() => this.closeModal()}

	    			style={[{ backgroundColor: globalStyles.color}, styles.checkButton] }>
	    			
	    			<Text style={{color:globalStyles.backgroundColor}}>Try again</Text>

	    		</TouchableOpacity>
			</View>,

			<View style={styles.headerMenu}>

				<Text onPress={() => this.closeModal(0)} style={{color: contentHeader.color}}>Rename</Text>
				
				<Text onPress={() => this.closeModal(1)} style={{color: contentHeader.color}}>Delete all</Text>
			</View>,

			<View style={styles.modalStyles}>

				<TextInput ref='renameFolderInput' placeholder='New name' underlineColorAndroid='green' />

			{/* `folderRename` lived on its component (called through modal close). but we don't want
				that handler to run on back press
			*/}
				<TouchableOpacity onPress={() => this.folderRename()}

	    			style={[{ backgroundColor: globalStyles.color}, styles.checkButton] }>

	    			<Text style={{color:globalStyles.backgroundColor}}>Rename</Text>
	    		
	    		</TouchableOpacity>
			</View>,

			<View style={styles.modalStyles}>
				<Text>Sure to delete all documents?</Text>

				<TouchableOpacity onPress={() => this.resetDocs()}

	    			style={[{ backgroundColor: globalStyles.color}, styles.checkButton] }>
	    			
	    			<Text style={{color:globalStyles.backgroundColor}}>Reset</Text>
	    		</TouchableOpacity>
			</View>
		];
	}

	folderSave () {
		var name = this.refs.newFolderInput._lastNativeText, that = this;

		if (name) // folders schema. 'verses' holds objects with the signature {quotation: '', text:''}
		store.get('AllFolders').then(items => {

			var noDup = items.every(m => m.folderName != name);

			if (noDup) store.push('AllFolders', {folderName: name, verses: []}).then(function() {
	    		// toast our babes or to success
				that._toast.show({
					position: Toast.constants.gravity.top,
	      			duration: 50,
					children: "saved",
					animationEnd: () => that.closeModal()
				})
			});
		})
	}

	folderRename () {
		var {clickPath: {key,displayName}} = this.props, newName = this.refs.renameFolderInput._lastNativeText,

		that = this, folderIndx, itemIndx;

		if (newName) store.get('AllFolders').then(items => {
    		
    		// get the old name it bore
    		folderIndx = items.findIndex(obj => obj[key] == displayName);
    		
    		if (folderIndx !== -1) items[folderIndx][key] = newName;

    		else {
    			folderIndx = items.findIndex(obj => {

    				// assuming it's impossible to have identical verse names at the same index
    				// but in separate dirs
    				itemIndx = obj.verses.findIndex(vObj => vObj[key] == displayName);

    				return itemIndx !== -1;
    			});

    			items[folderIndx].verses[itemIndx][key] = newName;
    		}

			store.save('AllFolders', items).then(() => that._toast.show({
				position: Toast.constants.gravity.top,
      			duration: 50,
				children: "Rename successful",
				animationEnd: () => that.closeModal()
			}))
		});
	}

	resetDocs () {
		var that = this;

		store.save('AllFolders', []).then(() => that._toast.show({
			position: Toast.constants.gravity.top,
  			duration: 50,
			children: "Deleted all documents",
			animationEnd: () => that.closeModal()
		}))
	}
}

const styles = StyleSheet.create({
	modalStyles: {
		marginTop: 250,
		minHeight: 200,
		backgroundColor: '#eee',
		marginHorizontal: 30,
		paddingTop: 15,
		paddingHorizontal: 10,
		shadowColor: '#aaa',
		//shadowOffset: {right:5},
		shadowOpacity: 4
	},
	toast: {
		height: 30,
		marginTop: 180,
	},
	testResults: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 10
	},
	  headerMenu: {
	  	left: 200,
	  	top: 50, // this should've been read from the icon's position
		backgroundColor: '#eee',
		paddingHorizontal: 10,
		paddingVertical: 10,
		maxWidth: 120,
		borderRadius: 5
	  },
	  checkButton: {
	  	marginHorizontal: 5,
	  	paddingVertical: 10,
	  	paddingHorizontal: 5,
	  	borderRadius: 5,
		bottom: 0,
		marginBottom: 5
	  }
});