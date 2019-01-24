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

			globalStyles: props.bodyStyles, contentHeader: props.contentHeader, verseText: ''
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

		if (modalChild === 6) this.initVerseText()
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
 
		        <Toast ref={component => (this._toast = component)} style={[styles.toast, {backgroundColor: contentHeader.backgroundColor}]}></Toast>
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
		var {globalStyles, contentHeader, verseText} = this.state, {backgroundColor, color} = globalStyles,

		{clickPath} = this.props, {checkButton, headerMenuItem} = styles;

		return [
			// 0: create folder
			<View style={styles.modalStyles}>
				<TextInput ref='newFolderInput' placeholder='Folder name' underlineColorAndroid={color}

					autoCapitalize='sentences' maxLength={15} style={{color: color}} />

				<TouchableOpacity onPress={() => this.folderSave()}

	    			style={[{ backgroundColor: color}, checkButton] }>
	    			<Text style={{color: backgroundColor}}>Create folder</Text>
	    		</TouchableOpacity>
			</View>,

			// 1: test success
			<View style={[styles.modalStyles, {marginTop: 150, minHeight: 150}]}>
				<Text style={{color: contentHeader.color, marginBottom: 20}}>Success! you remembered everything!</Text>
					
				<TouchableOpacity onPress={() => this.closeModal()}

	    			style={[{ backgroundColor: color}, checkButton] }>
	    			
	    			<Text style={{color: backgroundColor}}>Test another verse</Text>

	    		</TouchableOpacity>
			</View>,
			
			// 2: test corrections
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

	    			style={[{ backgroundColor: color}, checkButton] }>
	    			
	    			<Text style={{color: backgroundColor}}>Try again</Text>

	    		</TouchableOpacity>
			</View>,

			// 3: folders right headerMenu
			<View style={styles.headerMenu}>

				<Text onPress={() => this.closeModal(0)} style={[{color: contentHeader.color}, headerMenuItem]}>Rename</Text>

				<Text onPress={() => this.closeModal(1)} style={[{color: contentHeader.color}, headerMenuItem]}>Delete</Text>
				
				<Text onPress={() => this.closeModal(2)} style={[{color: contentHeader.color}, headerMenuItem]}>Delete all</Text>
			</View>,

			// 4: folder rename
			<View style={styles.modalStyles}>

				<TextInput ref='renameFolderInput' placeholder='New name' underlineColorAndroid={color}

					autoCapitalize='sentences' maxLength={15} style={{color: color}}
				/>

			{/* `folderRename` lived on its component (called through modal close). but we don't want
				that handler to run on back press
			*/}
				<TouchableOpacity onPress={() => this.folderRename()}

	    			style={[{ backgroundColor: color}, checkButton] }>

	    			<Text style={{color: backgroundColor}}>Rename</Text>
	    		
	    		</TouchableOpacity>
			</View>,

			// 5: delete all folders
			<View style={styles.modalStyles}>
				<Text>Sure to delete all documents?</Text>

				<View style={{flexDirection: 'row', flexWrap: 'nowrap'}}>

					<TouchableOpacity onPress={() => this.closeModal()}

		    			style={[{ backgroundColor: color}, checkButton] }>
		    			
		    			<Text style={{color: backgroundColor}}>Cancel</Text>
		    		</TouchableOpacity>

					<TouchableOpacity onPress={() => this.resetDocs()}

		    			style={[{ backgroundColor: '#f00'}, checkButton] }>
		    			
		    			<Text style={{color: '#fff'}}>Reset</Text>
		    		</TouchableOpacity>
		    	</View>
			</View>,

			// 6: edit verse contents
			<View style={[styles.modalStyles, {marginTop: 150}]}>				

				<TextInput multiline={true} style={{height: 60}} placeholder='New Reading' ref='vsUpdBox'

	    			style={{color: color}} autoCapitalize='sentences' autoCorrect={true}

	    			placeholderTextColor={color} selectTextOnFocus={true}

	    			defaultValue={verseText} underlineColorAndroid={color}
	    		/>

				<TouchableOpacity onPress={() => this.updateVerse(this.refs.vsUpdBox._lastNativeText)}

	    			style={[{ backgroundColor: color}, checkButton] }>
	    			
	    			<Text style={{color: backgroundColor}}>Update</Text>
	    		</TouchableOpacity>
			</View>,

			// 7: verses right headerMenu
			<View style={styles.headerMenu}>

				<Text onPress={() => this.closeModal(0)} style={[{color: contentHeader.color}, headerMenuItem]}>Edit</Text>
				
				<Text onPress={() => this.closeModal(1)} style={[{color: contentHeader.color}, headerMenuItem]}>Delete</Text>
			</View>,

			// 8: folder delete
			<View style={styles.modalStyles}>
				<Text>Sure to delete "{clickPath? clickPath.displayName: null}" and its contents?</Text>

				<View style={{flexDirection: 'row', flexWrap: 'nowrap'}}>

					<TouchableOpacity onPress={() => this.closeModal()}

		    			style={[{ backgroundColor: color}, checkButton] }>
		    			
		    			<Text style={{color:backgroundColor}}>Cancel</Text>
		    		</TouchableOpacity>

					<TouchableOpacity onPress={() => this.folderDelete()}

		    			style={[{ backgroundColor: '#f00'}, checkButton] }>
		    			
		    			<Text style={{color: '#fff'}}>Delete</Text>
		    		</TouchableOpacity>
		    	</View>
			</View>,

			// 9: verse delete
			<View style={styles.modalStyles}>
				<Text>Delete "{clickPath ? clickPath.displayName: null}"?</Text>

				<View style={{flexDirection: 'row', flexWrap: 'nowrap'}}>

					<TouchableOpacity onPress={() => this.closeModal()}

		    			style={[{ backgroundColor: color}, checkButton] }>
		    			
		    			<Text style={{color:backgroundColor}}>Cancel</Text>
		    		</TouchableOpacity>

					<TouchableOpacity onPress={() => this.verseDelete()}

		    			style={[{ backgroundColor: '#f00'}, checkButton] }>
		    			
		    			<Text style={{color: '#fff'}}>Delete</Text>
		    		</TouchableOpacity>
		    	</View>
			</View>
		];
	}

	folderSave () {
		var name = this.refs.newFolderInput._lastNativeText, that = this;

		if (name)
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

		that = this, folderIndx;

		if (newName) store.get('AllFolders')

		.then(items => {
    		
    		// get the old name it bore
    		folderIndx = items.findIndex(obj => obj[key] == displayName);
    		
    		if (folderIndx !== -1) items[folderIndx][key] = newName;

    		return items;
		})

		.then(xkl => {store.save('AllFolders', xkl); return xkl})

		.then(xkl => that._toast.show({
				position: Toast.constants.gravity.top,
      			duration: 50,
				children: "Rename successful",
				animationEnd: () => that.closeModal(xkl)
			})
		)
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

	updateVerse () {
		var {clickPath: {key,displayName}} = this.props, newCont = this.refs.vsUpdBox._lastNativeText,

		that = this, folderIndx, itemIndx;

		if (newCont) store.get('AllFolders')

		.then(items => {
		
    		// get the verse index
    		folderIndx = items.findIndex(obj => {

				itemIndx = obj.verses.findIndex(vObj => vObj[key] == displayName);

				return itemIndx !== -1;
			});

			items[folderIndx].verses[itemIndx].text = newCont;

			return items;
		})

		.then(xkl => {store.save('AllFolders', xkl); return xkl})

		.then(xkl => that._toast.show({
			position: Toast.constants.gravity.top,
  			duration: 50,
			children: "Edit successful",
			animationEnd: () => that.closeModal(xkl[folderIndx].verses)
		}));
	}

	initVerseText () {
		var that = this, {clickPath: {key, displayName}} = this.props;

		store.get('AllFolders').then(items => {
    		
    		// get the verse index
    		folderIndx = items.findIndex(obj => {

				itemIndx = obj.verses.findIndex(vObj => vObj[key] == displayName);

				return itemIndx !== -1;
			});

			that.setState({verseText: items[folderIndx].verses[itemIndx].text})
		});
	}

	folderDelete () {
		var {clickPath: {key,displayName}} = this.props, that = this;

		store.get('AllFolders')
		.then(items => items.filter(obj => obj[key] != displayName))

		.then(xkl => {store.save('AllFolders', xkl); return xkl})

		.then(xkl => that._toast.show({
				position: Toast.constants.gravity.top,
      			duration: 50,
				children: "Deleted",
				animationEnd: () => that.closeModal(xkl)
			})
		);
	}

	verseDelete () {
		var {clickPath: {key,displayName}} = this.props, that = this, folderIndx, itemIndx;

		store.get('AllFolders')

		.then(items => {
    		
    		// get the verse index
    		folderIndx = items.findIndex(obj => {

				itemIndx = obj.verses.findIndex(vObj => vObj[key] == displayName);

				return itemIndx !== -1;
			});

			items[folderIndx].verses = items[folderIndx].verses.filter((a,m) => m != itemIndx);

			return items;
		})

		.then(xkl => {store.save('AllFolders', xkl); return xkl})

		.then(xkl => that._toast.show({
				position: Toast.constants.gravity.top,
      			duration: 50,
				children: "Deleted",
				animationEnd: () => that.closeModal(xkl[folderIndx].verses)
			})
		);
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
		maxWidth: 120,
		borderRadius: 5
	  },
	  checkButton: {
	  	marginHorizontal: 5,
	  	marginTop: 30,
	  	paddingVertical: 10,
	  	paddingHorizontal: 5,
	  	borderRadius: 5,
		bottom: 0,
		marginBottom: 5
	  },
	  headerMenuItem: {
	  	borderBottomColor: '#ccc',
	  	borderBottomWidth: 1,
		paddingHorizontal: 10,
		paddingTop: 13,
		paddingBottom: 3
	  }
});