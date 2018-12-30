import React, {Component} from 'react';

import { Text, TextInput, View, StyleSheet, FlatList, } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import store from 'react-native-simple-store';

import FolderComp from './FolderComp';


export default class MemorizeScreen extends React.Component {

	constructor (props) {
		super(props);

		var {navigation: {state: {params}}} = props;

		this.state = { isTest: params.screenMode == 'test', modalChild: null, // index of modal child if any

			globalStyles: params.bodyStyles, titleBar: params.titleBar, contentHeader: params.contentHeader,

			childCloseToggle: null, headerMenuIndx: null, headerMenuCtx:{}
		};
	}

	static defaultProps = {
	  screenMap: {folders: 'folderName', verses: 'quotation', lastStep: true}, // screen title per `mode`

	  iconsMap: {folders: 'md-folder', verses: 'md-paper'},
	}

	static navigationOptions = ({ navigation} ) => {

		var titleBar = navigation.state.params.titleBar, headerRightHndlr = navigation.getParam('headerRightHndlr'),

		isTest = navigation.getParam('screenMode') === 'test', noRightHeader = {};

		Object.assign(noRightHeader, titleBar, {headerRight: null});

		if (navigation.state.routeName === 'MemorizeVerse' || isTest) {

			return headerRightHndlr === void(0) || isTest ? noRightHeader: (() => {
				titleBar.headerRight = <Icon name='md-more'

		            style={{color: navigation.getParam('headerRightColor'), fontSize:35, /*right: 10,*/ width:30}}
		          
		            onPress={() => headerRightHndlr()}
		          />;

		    	return titleBar;
		    })()
		}// tb changed inside. refer to it as params
		return navigation.state.params;
	};
  
  	// this runs after the first `render` call
  	componentDidMount() {
  		var {navigation: {state: {params}}} = this.props, that = this,

  		{headerRightHndlr, target, itemIndx, lastVisited, titleBar} = params;

		// mutate over folders, if any
  		// this runs async
		if (!headerRightHndlr && !target) that.props.navigation.setParams({
			headerRightHndlr: function() {

	    		if (that.state.displayData.props.data.length > 1) that.setState({childCloseToggle: (ind) =>

	    			that.headerMenuClose(ind), modalChild: 3})
	    	},

	    	headerRightColor: titleBar.headerTintColor
    	});

  		target

  			? this.setState({displayData: this.foldersAndHeader(target[itemIndx][lastVisited])})

  			: this.fetchFreshFolders();
    }

    componentWillReceiveProps(nextProps) {
  		var {navigation: {state: {params}}} = nextProps;
		
		// storing here to trigger update
		this.setState({globalStyles: params.bodyStyles, contentHeader: params.contentHeader,
			
			titleBar: params.titleBar
		});
    }

	render() {
		var {globalStyles, contentHeader, titleBar, modalChild, headerMenuCtx, displayData} = this.state,

		{navigation: {state: {params}}} = this.props;

		if (displayData) {
			return <FolderComp formattedComponents={displayData}

				modalChild={modalChild} bodyStyles={globalStyles} contentHeader={contentHeader}

				titleBar={titleBar} onChildModalClose={this.state.childCloseToggle} clickPath={headerMenuCtx}
			/>;
		}

		else return <View key='cv'><Text>loading...</Text></View>;/*animation */
	}

	fetchFreshFolders () {
    	store.get('AllFolders').then(function (arr) {

    		arr = arr || []; // on install, this is null

			this.setState({displayData: this.foldersAndHeader(arr), modalChild: null});

	    }.bind(this));
    }

	newFolderButton () {
		this.setState({modalChild: 0, childCloseToggle: () => this.fetchFreshFolders()});
	}

	// prepends an icon for creating a new folder, along with previous folders
	foldersAndHeader (data) {
		
		var { contentHeader, globalStyles, isTest, headerMenuIndx} = this.state, folders = [],

		{navigation, screenMap, iconsMap} = this.props, {state: {params}} = navigation,

		possibleModes = Object.keys(screenMap), lastVisited = params.lastVisited || possibleModes[0],

		addButton = <Icon style={[styles.folders, styles.dataColumn, {color:globalStyles.color}]}

			key='add new' name='md-add-circle'
			
			onPress={() => this.newFolderButton()}
		/>,

		includeAddButton = (() => {
			if (!isTest && lastVisited == possibleModes[0]) {

				data.unshift(addButton);

				return true;
			}
			return false;
		})(),

		testNoFolder = <View style={{flexDirection: 'row'}}>

			<Text style={{marginLeft: 10, color: globalStyles.color}} onPress={() => navigation.navigate('MemorizeVerse',

				{titleBar: params.titleBar, bodyStyles: globalStyles, contentHeader: contentHeader})}
			>Create a folder to begin</Text>

			<Icon name='md-rocket' size={15} style={{color: globalStyles.color, marginLeft: 10}} />
		</View>;

        if (!data.length ) {
        	folders = <View key='cv'>

        		{lastVisited == 'verses'

    				? <Text key='mtfldr'>empty folder</Text>

    				: isTest ? testNoFolder : addButton
        		}
			</View>;
		}

		else {

			var iconName = iconsMap[lastVisited], ctx = screenMap[lastVisited], that = this,

			currScr = possibleModes.indexOf(lastVisited), longestPath = currScr >= possibleModes.length-2;

	        folders = <FlatList
	          data={data} numColumns={3} key='cv' initialNumToRender={10}

	          renderItem={function ({item, index}) {

	          	if (includeAddButton !== false && index == 0 && !longestPath) {
	          		item.key = 'items'+0;

	          		return item;
	          	}

	          	return <View key={'items'+index} style={styles.dataColumn}>
		        	<Icon
			    		name={iconName} style={[styles[lastVisited], styles.folders, {color:globalStyles.color}]}

			    		onPress={headerMenuIndx === null || headerMenuIndx === void(2) ?() => {

			    			 var scrName = ['MemorizeVerse', 'FinalScreen'];

			    			 scrName = currScr === 0
			    			 	? isTest ? 'TestVerse' : scrName[currScr]
			    			 	: scrName[currScr];

				    			navigation.push(scrName, {lastVisited: possibleModes[currScr+1],

				    				target: data, itemIndx:index, bodyStyles: globalStyles, 

				    				titleBar: params.titleBar, contentHeader: params.contentHeader,

				    				childCloseToggle: null, screenMode: params.screenMode
				    			})
				    		}: () => {

				    			that.setState({modalChild: 4+headerMenuIndx, childCloseToggle: () => that.fetchFreshFolders(),

				    			headerMenuIndx: null, headerMenuCtx: {key: ctx, displayName: item[ctx]}
				    		});
				    		}
			    		}
		        	/>
		        	<Text style={{color: globalStyles.color}}>{item[ctx]}</Text>
		        </View>;
	          }}
	        />;
	    }

        return folders;
	}

	// `ind` is undef on menu backpress
	headerMenuClose (ind) {

		if (ind === void(4)) this.setState({headerMenuIndx: null, modalChild: null});

		// we have a value here. listen for changes by reassigning the listeners
		else {
			var currData = this.state.displayData.props.data, {screenMap, navigation} = this.props;

			if (Object.keys(screenMap).indexOf(navigation.state.params.lastVisited) == 0) currData.shift(); // omit add button

			if (ind === 0) this.setState({headerMenuIndx: ind, modalChild: null, displayData: null}, () =>{

				// set an init state above since foldersAndHeader expects a live value from headerMenuIndx

				// omit the add button in the current view since foldersAndHeader will still give us another one
				currData.shift()
				this.setState({displayData: this.foldersAndHeader(currData)})
			});

			// delete dialog should be raised at once so dont overwrite curr view
			else this.setState({headerMenuIndx: ind, modalChild: 4+ ind, childCloseToggle: () => this.fetchFreshFolders()});
		}
	}
}

const styles = StyleSheet.create({
	folders: {
		fontSize: 80,
	},
	nullText: {
		color: 'red',
	},
	correctText: {
		color: 'green',
	},
	dataColumn: {
		marginHorizontal: 15,
		marginVertical: 10
	}
});