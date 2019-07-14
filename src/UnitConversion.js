import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MUIDataTable from "mui-datatables";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import NumberFormat from 'react-number-format';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';


const styles = theme => ({  
    table: {
        margin: '20px'
    },	
    dialog: {
        minWidth: '450px',
    },
    title: {
      textAlign: 'center',
      margin: '20px',
      padding: '20px'
    },
    paper: {
      margin: theme.spacing.unit,
      minHeight: '500px'
    },
});

const UNIT_LIST = {
    kelvin: { 
        name: 'Kelvin', 
        type: 'temperature', 
        convertFrom: (value)=> {return value;},
        convertTo: (value)=> {return value;}
    }, 
    celsius: {
        name: 'Celsius',
        type: 'temperature',
        convertFrom: (value)=> {return value + 273.15;},
        convertTo: (value)=> {return value - 273.15}
    }, 
    fahenheit: {
        name: 'Fahrenheit',
        type: 'temperature',
        convertFrom: (value)=> {return (value - 32) * 5.0 / 9.0 + 273.15;},
        convertTo: (value)=> {return (value - 273.15) * 9.0 / 5.0 + 32;}
    },
    rankine: {
        name: 'Rankine',
        type: 'temperature',
        convertFrom: (value)=> {return value * 5.0 / 9.0;},
        convertTo: (value)=> {return value * 9.0 / 5.0;}
    },
    liters: {
        name: 'liters',
        type: 'volume',
        convertFrom: (value)=> {return value;},
        convertTo: (value)=> {return value}
    },
    tablespoons: {
        name: 'tablespoons',
        type: 'volume',
        convertFrom: (value)=> {return value / 67.628;},
        convertTo: (value)=> {return value * 67.628;}
    },
    cubicInches: {
        name: 'cubic-inches',
        type: 'volume',
        convertFrom: (value)=> {return value / 61.024;},
        convertTo: (value)=> {return value * 61.024;}
    },
    cups: {
        name: 'cups',
        type: 'volume',
        convertFrom: (value)=> {return value / 4.227;},
        convertTo: (value)=> {return value * 4.227;}
    },
    cubicFeet: {
        name: 'cubic-feet',
        type: 'volume',
        convertFrom: (value)=> {return value * 28.317;},
        convertTo: (value)=> {return value / 28.317;}
    },
    gallons: {
        name: 'gallons',
        type: 'volume',
        convertFrom: (value)=> {return value * 3.785;},
        convertTo: (value)=> {return value / 3.785;}
    }
};

function NumberFormatCustom(props) {
	const { inputRef, onChange, ...other } = props;
  
	return (
	  <NumberFormat
			{...other}
			getInputRef={inputRef}
			onValueChange={values => {
				onChange({
				target: {
					value: values.value,
				},
				});
			}}
	  />
	);
  }

class UnitConversion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            worksheet: {},
            worksheets: {
                1: {
                    id: 1,
                    studentName: 'Kevin', 
                    inputValue: 123.1, 
                    inputUnit: 'kelvin', 
                    targetUnit: 'celsius', 
                    studentResponse: 149.9,
                    output: 'correct'
                },
                2: {
                    id: 2,
                    studentName: 'Peter', 
                    inputValue: 123.1, 
                    inputUnit: 'kelvin', 
                    targetUnit: 'celsius', 
                    studentResponse: 149.8,
                    output: 'incorrect'
                }
            }
        };        
    };

    clearWorksheet = ()=> {
        let worksheet = Object.assign({});
        this.setState({worksheet});
    }

    onChange = name => (e)=> {
        let worksheet = Object.assign({}, this.state.worksheet);
        worksheet[name] = e.target.value;
        this.setState({worksheet});
    }

    openDialog = (worksheetId) => {
        if (worksheetId) {
            this.setState({worksheet: this.state.worksheets[worksheetId]});
        }
        else {
            this.clearWorksheet();
        }
		this.setState({
			dialogOpen: true,
		});
    }
    
    onDelete = (worksheetId) => {
        if (window.confirm("Confirm to delete the worksheet？")) {
            let worksheets = Object.assign({}, this.state.worksheets);
            delete worksheets[worksheetId];
            this.setState({worksheets});
        }
    }

	closeDialog = () => {
        this.setState({ 
			dialogOpen: false,
		});
    };

    roundTenth = (input) => {
        return Math.round(input * 10) / 10.0;
    }

    getOutput = (worksheet)=> {
        let inputUnit = worksheet.inputUnit;
        let targetUnit = worksheet.targetUnit;
        let inputValue = worksheet.inputValue;
        if (UNIT_LIST[inputUnit].type === UNIT_LIST[targetUnit].type) {
            let expectedValue = UNIT_LIST[targetUnit].convertTo(UNIT_LIST[inputUnit].convertFrom(inputValue));
            console.log(UNIT_LIST[inputUnit].convertFrom(inputValue));
            console.log(this.roundTenth(expectedValue));
            return this.roundTenth(expectedValue) === this.roundTenth(worksheet.studentResponse) ? 'correct' : 'incorrect';
        }
        else {
            return 'invalid';
        }
    }
    
    onSubmit = ()=> {
        let validity = document.getElementById("worksheet").reportValidity();
        if (validity) {
            let id = this.state.worksheet.id || new Date().getTime();
            let worksheet = Object.assign(this.state.worksheet, {id});
            let worksheets = Object.assign({}, this.state.worksheets);
            worksheets[id] = worksheet;
            worksheet.output = this.getOutput(worksheet);
            this.setState({worksheets});
            this.closeDialog();
        }
    }

    formatData = (worksheets) => {
        return Object.keys(worksheets)
            .map((id, index)=> {
                let worksheet = worksheets[id];
                return [
                    worksheet.id,
                    worksheet.studentName,
                    worksheet.inputValue,
                    worksheet.inputUnit,
                    worksheet.targetUnit,
                    worksheet.studentResponse,
                    worksheet.output,
                    <span>
                        <IconButton title="Delete" aria-label="Delete" onClick={()=>this.onDelete(worksheet.id)}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton title="edit" aria-label="Edit" onClick={()=>this.openDialog(worksheet.id)}>
                            <EditIcon />
                        </IconButton>
                    </span>
                ];
            });
    }

    
    render() {
        const { classes } = this.props;
        const { dialogOpen, worksheet, worksheets } = this.state;
        // console.log(worksheets);
        const columns = [
            {
                name: "Id",
                options: {
                    display: 'false'
                }
            },
            "Student Name",
            "Input Numerical Value", 
            "Input Unit of Measure", 
            "Target Unit of Measure", 
            "Student Response",
            "Output",
            "Operation"
        ];
        const data = this.formatData(worksheets);

        const options = {
            filter: false,
            viewColumns: false,
            download: true,
            print: true,
            search: true,
            selectableRows: 'none'

        };

            
        return (
            <Paper className={classes.paper} elevation={1}>
                <div>
					<Dialog
						aria-labelledby="form-dialog-title"
						open={dialogOpen}
                        onClose={this.closeDialog}        
                        className={classes.dialog}    
						>
						<DialogTitle id="form-dialog-title" color="primary">Worksheet</DialogTitle>
						<DialogContent className={classes.dialog}>
                            <form id="worksheet">
                                <FormGroup>
                                    <TextField
                                        label="Student Name"
                                        type="text"
                                        className="form-control"
                                        name="inputValue"
                                        value={worksheet.studentName}
                                        onChange={this.onChange('studentName')}
                                        margin="normal"
                                        required
                                        fullWidth
                                        autoFocus
                                        />
                                    <br />
                                    <TextField
                                        label="Input Numerical Value"
                                        type="text"
                                        className="form-control"
                                        name="inputValue"
                                        value={worksheet.inputValue}
                                        onChange={this.onChange('inputValue')}
                                        margin="normal"
                                        required
                                        fullWidth
                                        InputProps={{
                                            inputComponent: NumberFormatCustom
                                        }}	
                                        />
                                    <br />
                                    <TextField
                                        select
                                        required
                                        label="Input Unit of Measure"
                                        className={classes.textField}
                                        value={worksheet.inputUnit}
                                        onChange={this.onChange('inputUnit')}
                                        InputLabelProps={{
                                            shrink:worksheet.inputUnit ? true : false
                                        }}
                                        InputProps={{
                                            name: 'inputUnit'
                                        }}
                                    >
                                        {
                                            Object.keys(UNIT_LIST).map((key, index) => {
                                                let unit = UNIT_LIST[key];
                                                return <MenuItem key={key} value={key}>{unit.name}</MenuItem>;
                                            })
                                        }
                                    </TextField>
                                    <br />
                                    <TextField
                                        select
                                        required
                                        label="Target Unit of Measure"
                                        className={classes.textField}
                                        value={worksheet.targetUnit}
                                        onChange={this.onChange('targetUnit')}
                                        InputLabelProps={{
                                            shrink:worksheet.inputUnit ? true : false
                                        }}
                                        InputProps={{
                                            name: 'targetUnit'
                                        }}
                                    >
                                        {
                                            Object.keys(UNIT_LIST).map((key, index) => {
                                                let unit = UNIT_LIST[key];
                                                return <MenuItem key={key} value={key}>{unit.name}</MenuItem>;
                                            })
                                        }
                                    </TextField>
                                    <br />
                                    <TextField
                                        label="Student Response"
                                        type="text"
                                        className="form-control"
                                        name="studentResponse"
                                        value={worksheet.studentResponse}
                                        onChange={this.onChange('studentResponse')}
                                        margin="normal"
                                        required
                                        fullWidth
                                        InputProps={{
                                            inputComponent: NumberFormatCustom
                                        }}	
                                        />
                                </FormGroup>
                            </form>
						</DialogContent>
						<DialogActions>
                            <Button variant="contained" onClick={this.onSubmit} color="primary" >
								Confirm
							</Button>
                            <Button onClick={this.closeDialog} color="primary" >
								Close
							</Button>
						</DialogActions>
					</Dialog>
				</div>	
                <Typography variant="headline" component="h3" className={classes.title}>
                    Unit Conversion
                </Typography>
                <div style={{textAlign: 'right', marginRight: '30px'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => this.openDialog()}
                        className={classes.button}
                        >
                        New
                    </Button>
                </div>
                <MUIDataTable
                    data={data}
                    columns={columns}
                    options={options}
                    className= {classes.table}
                    />
            </Paper>
        );
    };
}
export default withStyles(styles, { withTheme: true })(UnitConversion);