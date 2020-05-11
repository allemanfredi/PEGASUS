import React from 'react'

class Picklist extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.onClickItem = this.onClickItem.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)

    this.state = {
      opened: false
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ opened: false })
    }
  }

  onClickItem(option) {
    if (this.props.onSelect) {
      this.props.onSelect(option)
      this.setState({ opened: !this.state.opened })
    }
  }

  render() {
    return (
      <div ref={ref => (this.wrapperRef = ref)}>
        <input
          name={this.props.name ? this.props.name : ''}
          id={this.props.id ? this.props.id : ''}
          value={this.props.text ? this.props.text : ''}
          onClick={() => this.setState({ opened: !this.state.opened })}
          placeholder={this.props.placeholder}
          className="picklist"
        />
        {this.state.opened ? (
          <div class="picklist-menu-container">
            <div id="picklist-menu" className="picklist-menu">
              {this.props.options.map((option, index) => {
                return (
                  <div
                    key={index.toString()}
                    onClick={() => this.onClickItem(index)}
                    className="picklist-item"
                  >
                    {option}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

export default Picklist
