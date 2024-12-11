// CountrySelector.jsx
import PropTypes from 'prop-types';
import { countryViews } from '../../utils/MapConstants';

const CountrySelector = ({ selectedCountry, onCountryChange, onBack, reactors, onReactorChange }) => (
    <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 flex flex-col gap-2 z-[1000]">
        <select
            value={selectedCountry}
            onChange={onCountryChange}
            className="px-2 py-1 bg-zinc-800 text-white rounded border border-zinc-600 hover:bg-zinc-700 transition-colors text-xs sm:text-sm font-medium"
        >
            <option value="" disabled>
                Select a country
            </option>
            {Object.keys(countryViews).map((country) => (
                <option key={country} value={country}>
                    {country}
                </option>
            ))}
        </select>
        {selectedCountry && (
            <select
                onChange={onReactorChange}
                className="px-2 py-1 bg-zinc-800 text-white rounded border border-zinc-600 hover:bg-zinc-700 transition-colors text-xs sm:text-sm font-medium"
            >
                <option value="" disabled>
                    Select a reactor
                </option>
                {reactors.map((reactor) => (
                    <option key={reactor.Id} value={reactor.Id}>
                        {reactor.Name}
                    </option>
                ))}
            </select>
        )}
        <button
            onClick={onBack}
            className="px-2 py-1 bg-zinc-800 text-white rounded border border-zinc-600 hover:bg-zinc-700 transition-colors text-xs sm:text-sm font-medium"
        >
            Back
        </button>
    </div>
);

CountrySelector.propTypes = {
    selectedCountry: PropTypes.string.isRequired,
    onCountryChange: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    reactors: PropTypes.arrayOf(PropTypes.shape({
        Id: PropTypes.number.isRequired,
        Name: PropTypes.string.isRequired,
    })).isRequired,
    onReactorChange: PropTypes.func.isRequired,
};

export default CountrySelector;