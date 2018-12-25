import React, {Component} from 'react';

import { StyleSheet, Text, } from 'react-native';

// highlights haystack at points where needle values doesn't rhyme
function badToGood (needle, haystack, css) {

	var x = haystack.split(' '), nullStart = 0, nullWeds=[], currLen =0, nullIndx = [],

	m, z = x.map((r,i) => i != x.length-1 ? `(${r} )?`: `(${r})?`).join('');

	z = new RegExp(`(${z})`,'mgi');
	
	// every missing node from the regex indicates wrong input
	while ((m = z.exec(needle)) !== null) {

		if (m.index === z.lastIndex) {

			if (!nullStart) { // check whether we're in null word mode
				var u = m.index, current = /(\w+)/.exec(needle.substr(u));

				if (current !== null && current.length) {

					nullStart = current[0].length- +(nullWeds.length); // first match has no trailing spaces

					nullWeds.push({start: u, end: u + nullStart});
				}
			}
			else nullStart--;
			z.lastIndex++;
		}	
	}
	
	nullWeds = nullWeds.map(o => haystack.substring(o.start, o.end));

	if (!nullWeds.length) return 0;

	else return x.map((eachWord, o) => {
		
		if (!nullWeds.includes(eachWord)) return <Text key={o} style={styles.testText}>{eachWord}</Text>;

		return <Text style={[styles.testText, css]} key={o}>{eachWord}</Text>;
	});
}

// highlights needle at points where haystack values doesn't rhyme
function goodToBad (needle, haystack, css) {

	var x = haystack.split(' '), nullStart = 0, nullWeds=[], currLen =0, nullIndx = [],

	m, z = x.map((r,i) => i != x.length-1 ? `(${r} )?`: `(${r})?`).join('');

	z = new RegExp(`(${z})`,'mgi');
	
	// every missing node from the regex indicates wrong input
	while ((m = z.exec(needle)) !== null) {

		if (m.index === z.lastIndex) {

			if (!nullStart) { // check whether we're in null word mode
				var u = m.index, current = /(\w+)/.exec(haystack.substr(u));

				if (current !== null && current.length) {
					
					nullStart = current[0].length;
				
					nullWeds.push({start: u, end:  nullStart+u});
				}
			}
			else nullStart--;
			
			z.lastIndex++;
		}	
	}

	nullWeds = nullWeds.map(o => haystack.substring(o.start, o.end));

	if (!nullWeds.length) return 0;

	else return x.map((eachWord, o) => {

		if (!nullWeds.includes(eachWord)) return <Text key={o} style={styles.testText}>{eachWord}</Text>;

		return <Text style={[styles.testText, css]} key={o}>{eachWord}</Text>;
	});
}

const styles = StyleSheet.create({
	testText: {
		flexShrink: 1,
		borderColor: '#000',
		borderStyle: 'solid',
		marginLeft: 5,
		marginRight: 5,
	},
});

module.exports = {GoodToBad: goodToBad, BadToGood: badToGood};