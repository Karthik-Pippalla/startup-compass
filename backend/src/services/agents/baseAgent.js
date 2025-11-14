class BaseAgent {
  constructor(name) {
    this.name = name;
  }

  async execute() {
    throw new Error(`Agent ${this.name} must implement execute()`);
  }
}

module.exports = BaseAgent;
