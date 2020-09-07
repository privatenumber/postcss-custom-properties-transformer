const { stringify: str } = JSON;

class PropertyNameManifest extends Map {
	mark(propertyName, originalPropertyName) {
		if (this.has(propertyName)) {
			const prevPropName = this.get(propertyName);
			if (originalPropertyName !== prevPropName) {
				console.warn(`Property name ${str(propertyName)} was generated from input ${str(originalPropertyName)} but was already generated from input ${str(prevPropName)}`);
			}
		} else {
			this.set(propertyName, originalPropertyName);
		}
	}
}

module.exports = PropertyNameManifest;
