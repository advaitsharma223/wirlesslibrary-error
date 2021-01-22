import React from 'react';
import { Text,
    View, 
    TouchableOpacity,
    StyleSheet,
    TextInput, 
    Image, 
    Alert, 
    KeyboardAvoidingView,
    ToastAndroid }   
    from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config.js'
import * as firebase from 'firebase';

export default class TransactionScreen extends  React.Component{
    constructor() {
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            buttonState:'normal',
            scannedBookId: '',
            scannedStudentId: '',
            transactionMessage: '',
        }
    }

    getCameraPermissions = async (id) =>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);

        this.setState({
            hasCameraPermissions: status === "granted",
            buttonState: id,
            scanned: false
        })
    }
    
    handleBarCodeScanned = async({type, data})=> {
        const {buttonState} = this.state;
        if(buttonState === 'BookId') {
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState:'normal'
            })
        }else if(buttonState === 'StudentId') {
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState:'normal'
            })
        }       
    }
    handleTransaction = async()=> {
        var transactionMessage = null;
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
            var book = doc.data();
            if(book.bookAvailibility) {
                this.initiateBookIssue();
                transactionMessage = "Book Issued";
                ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
            }else{
                this.initiateBookReturn();
                transactionMessage = "Book Returned"
                ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
            }
        })
        this.setState({
            transactionMessage: transactionMessage
        }) 
    }
    initiateBookIssue = async()=> {
        db.collection('transaction').add({
            'studentId':this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.TimeStamps.now().toDate(),
            'transactionType': 'Issue', 
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability': false
        })

        db.collection('students').doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
        })
        
        Alert.alert("Book Issued")
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''
        })
    }

    initiateBookReturn = async()=> {
        db.collection('transaction').add({
            'studentId':this.state.scannedStudentId,
            'bookId': this.state.scannedBookId,
            'date': firebase.firestore.TimeStamps.now().toDate(),
            'transactionType': 'Return', 
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability': true
        })

        db.collection('students').doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
        })
        
        Alert.alert("Book Returned")
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''
        })
    }
    
    render() {
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        console.log(buttonState);
        if(buttonState !== "normal" && hasCameraPermissions){
            return(
                <BarCodeScanner onBarCodeScanned = {scanned ? undefined: this.handleBarCodeScanned}/> 
            );
        }else if(buttonState === "normal") {
            return(
                <KeyboardAvoidingView style={styles.container} behaviour='padding' enabled>
                    <View> 
                        <Image source = {require('../assets/booklogo.jpg')} style = {{width: 200, height: 200}} />
                        <Text style = {{textAlign: 'center', fontSize: 30}}>Wily</Text>
                    </View>
                    <View style = {styles.inputView}>
                        <TextInput style = {styles.inputBox} 
                        placeholder = "Book Id" value = {this.state.scannedBookId}
                        onChangeText={text=> this.setState({scannedBookId: text})}
                        value={this.state.scannnedBookId}/>
                        <TouchableOpacity style={styles.scanButton} 
                        onPress = {()=>{this.getCameraPermissions("BookId")}}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>                    
                    <View style = {styles.inputView}>
                        <TextInput style = {styles.inputBox} 
                        placeholder = "Student Id"
                        onChangeText={text=> this.setState({scannedStudentId: text})}
                         value = {this.state.scannedStudentId}/>
                        <TouchableOpacity style={styles.scanButton} 
                        onPress = {()=>{this.getCameraPermissions("StudentId")}}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style = {styles.submitButton} 
                    onPress = {async () => {
                        var transactionMessage = await this.handleTransaction();
                    }} >
                        <Text style = {styles.submitButtonText}>Submit</Text>                        
                    </TouchableOpacity>
                </KeyboardAvoidingView> 
            );
        }
        
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });
  