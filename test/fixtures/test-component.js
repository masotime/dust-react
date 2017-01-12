import React from 'react';

export class TestComponent extends React.Component {
	render () {
		return (
			<div className='test-case'>
				{this.props.example}
			</div>
		);
	}
}
