const {stringify: string} = JSON;

class PropertyNameManifest extends Map {
	mark(propertyName, originalPropertyName) {
		if (this.has(propertyName)) {
			const previousPropName = this.get(propertyName);
			if (originalPropertyName !== previousPropName) {
				console.warn(`Property name ${string(propertyName)} was generated from input ${string(originalPropertyName)} but was already generated from input ${string(previousPropName)}`);
			}
		} else {
			this.set(propertyName, originalPropertyName);
		}
	}
}

module.exports = PropertyNameManifest;
