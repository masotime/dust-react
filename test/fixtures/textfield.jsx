'use strict';

var React = require('react');

var Textfield = React.createClass({
	getDefaultProps: function () {
		return {
			value: '',
			tooltip: 'A tooltip',
			label: 'A textfield',
			id: 'text-id',
			className: 'text'
		};
	},
	render: function () {
		var props = this.props;

		return (<div className={props.className}>
			<label htmlFor={props.id}>{props.label}</label>
			<input id={props.id} type="text" defaultValue={props.value} />
			<div className="tooltip">{props.tooltip}</div>
		</div>);
	}
});

module.exports = Textfield;