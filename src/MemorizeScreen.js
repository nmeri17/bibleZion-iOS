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

		var titleBar = navigation.state.params.titleBar, s = navigation.getParam('headerRightHndlr');

		if (navigation.state.routeName === 'MemorizeVerse' ) {

			return s === void(0) ? titleBar: (() => {
				titleBar.headerRight = <Icon name='md-more'

		            style={{color: navigation.getParam('headerRightColor'), fontSize:35, right: 10}}
		          
		            onPress={() => s()}
		          />;

		    	return titleBar;
		    })()
		}// tb changed inside. refer to it as params
		return navigation.state.params;
	};
  
  	// this runs after the first `render` call
  	componentDidMount() {
  		var {navigation: {state: {params}}} = this.props, that = this;

  		// this runs async
		if (!params.headerRightHndlr) that.props.navigation.setParams({
			headerRightHndlr: function() {

	    		that.setState({childCloseToggle: (ind) =>that.headerMenuClose(ind), modalChild: 3})
	    	},

	    	headerRightColor: params.titleBar.headerTintColor
    	});

  		params.target

  			? this.setState({displayData: this.foldersAndHeader(params.target[params.itemIndx][params.lastVisited])})

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

		addButton = <Icon style={[styles.folders, styles.dataColumn, globalStyles]}

			key='add new' name='md-add-circle'
			
			onPress={() => this.newFolderButton()}
		/>,

		includeAddButton = (() => {
			if (!isTest && lastVisited == possibleModes[0]) {

				data.unshift(addButton);

				return true;
			}
			return false;
		})();

        if (!data.length ) {
        	if (isTest) folders =
        		<View key='cv' style={{flexDirection: 'row'}}>
					<Text onPress={() => navigation.navigate('MemorizeVerse',

						{titleBar: params.titleBar, bodyStyles: globalStyles, contentHeader: contentHeader})}
					>create a folder to begin</Text>
					<Icon name='md-rocket' size={15} style={{color: globalStyles.color}} />
				</View>
			;
			else folders = lastVisited == 'verses' ? <Text key='cv'>empty folder</Text> : addButton;
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
			    		name={iconName} style={[styles[lastVisited], styles.folders, globalStyles]}

			    		onPress={headerMenuIndx === null || headerMenuIndx === void(2) ?() => {

			    			 var scrName = ['MemorizeVerse', 'FinalScreen'][currScr];

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

				// setting the first state since foldersAndHeader expects a live value from headerMenuIndx
				this.setState({displayData: this.foldersAndHeader(currData)})
			});

			// delete dialog should be raised at once so dont overwrite curr view
			else this.setState({headerMenuIndx: ind, modalChild: 4+ ind});
		}
	}
}

const styles = StyleSheet.create({
	folders: {
		fontSize: 30,
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
