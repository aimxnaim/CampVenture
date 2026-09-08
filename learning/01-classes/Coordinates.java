/**
 * A record: an immutable carrier for a fixed set of values.
 *
 * This single line generates, at compile time:
 *   - a constructor  Coordinates(double, double)
 *   - accessors      latitude()  and  longitude()      <- NOT getLatitude()
 *   - equals()       comparing by value, not identity
 *   - hashCode()     consistent with that equals()
 *   - toString()     e.g. Coordinates[latitude=3.38, longitude=101.774]
 *
 * The fields are implicitly private and final. A record can never be mutated,
 * which is exactly what you want for a pair of coordinates: they describe a
 * place, they have no identity of their own, and two pairs with the same
 * numbers ARE the same thing.
 *
 * In the old app this was campground.geometry.coordinates -- a [lng, lat]
 * array where nothing stopped you putting the values in backwards. Here the
 * names are part of the type, and the constructor refuses bad input.
 */
public record Coordinates(double latitude, double longitude) {

    /*
     * A COMPACT CONSTRUCTOR. Note there is no parameter list and no
     * "this.latitude = latitude" -- the compiler adds the assignments after
     * this body runs. Its only job is validation (and occasionally
     * normalisation, e.g. trimming a string).
     *
     * Because this runs before the fields are assigned, an object of this type
     * cannot exist in an invalid state. There is no "created but not yet
     * validated" window the way there is when validation lives in a separate
     * step.
     */
    public Coordinates {
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException(
                    "latitude must be between -90 and 90, got " + latitude);
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException(
                    "longitude must be between -180 and 180, got " + longitude);
        }
    }

    /*
     * Records can have ordinary methods too -- they just cannot have extra
     * instance fields beyond the ones in the header.
     *
     * Mapbox and GeoJSON both order coordinates as [longitude, latitude],
     * which is the reverse of how people say them out loud. Naming that
     * conversion here means the surprise is written down in one place instead
     * of being rediscovered every time someone reads clusterMap.js.
     */
    public String toGeoJsonOrder() {
        return "[" + longitude + ", " + latitude + "]";
    }
}
