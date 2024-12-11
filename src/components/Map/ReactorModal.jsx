// ReactorModal.jsx
import PropTypes from 'prop-types';
import { getStatusColor, formatValue } from '../../utils/MapUtils';

const ReactorModal = ({ reactors, onClose }) => {
    // Get base name without unit numbers
    const baseName = reactors[0].Name.replace(/-\d+$/, '');
    // Get common properties
    const commonProps = {
        Country: reactors[0].Country,
        ReactorType: reactors.every(r => r.ReactorType === reactors[0].ReactorType) ? reactors[0].ReactorType : null,
        ReactorModel: reactors.every(r => r.ReactorModel === reactors[0].ReactorModel) ? reactors[0].ReactorModel : null,
    };

    const getLatestUpdate = () => {
        return reactors.reduce((latest, reactor) => {
            return reactor.LastUpdatedAt > latest ? reactor.LastUpdatedAt : latest;
        }, reactors[0].LastUpdatedAt);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700 shadow-2xl">
                <div className="sticky top-0 flex justify-end p-4 bg-zinc-800 border-b border-zinc-700">
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {/* Common Information */}
                    <h3 className="text-xl font-bold text-white mb-4">{baseName}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="col-span-2">
                            <div className="text-zinc-200">{formatValue(commonProps.Country)}</div>
                            <div className="text-sm text-zinc-400">Location</div>
                        </div>
                        {commonProps.ReactorType && (
                            <div>
                                <div className="text-zinc-200">{formatValue(commonProps.ReactorType)}</div>
                                <div className="text-sm text-zinc-400">Type</div>
                            </div>
                        )}
                        {commonProps.ReactorModel && (
                            <div>
                                <div className="text-zinc-200">{formatValue(commonProps.ReactorModel)}</div>
                                <div className="text-sm text-zinc-400">Model</div>
                            </div>
                        )}
                    </div>

                    {/* Unit-specific Information */}
                    <div className="space-y-4">
                        {reactors.map((reactor) => (
                            <div key={reactor.Id} className="bg-zinc-900/50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-lg font-semibold text-white">Unit {reactor.Name.split('-').pop()}</h4>
                                    <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(reactor.Status)} bg-zinc-900/50`}>
                                        {formatValue(reactor.Status)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xl font-mono font-bold text-emerald-400">{formatValue(reactor.Capacity, 'MWe')}</div>
                                        <div className="text-sm text-zinc-400">Capacity</div>
                                    </div>
                                    {!commonProps.ReactorModel && (
                                        <div>
                                            <div className="text-zinc-200">{formatValue(reactor.ReactorModel)}</div>
                                            <div className="text-sm text-zinc-400">Model</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-zinc-200">{formatValue(reactor.ConstructionStartAt)}</div>
                                        <div className="text-sm text-zinc-400">Construction Start</div>
                                    </div>
                                    <div>
                                        <div className="text-zinc-200">{formatValue(reactor.OperationalFrom)}</div>
                                        <div className="text-sm text-zinc-400">Operational From</div>
                                    </div>
                                    {reactor.OperationalTo && (
                                        <div className="col-span-2">
                                            <div className="text-zinc-200">{formatValue(reactor.OperationalTo)}</div>
                                            <div className="text-sm text-zinc-400">Operational Until</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-xs text-zinc-500 text-right">
                        Last updated: {new Date(getLatestUpdate()).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

ReactorModal.propTypes = {
    reactors: PropTypes.arrayOf(PropTypes.shape({
        Id: PropTypes.number.isRequired,
        Name: PropTypes.string,
        Capacity: PropTypes.number,
        ReactorType: PropTypes.string,
        ReactorModel: PropTypes.string,
        Country: PropTypes.string,
        ConstructionStartAt: PropTypes.string,
        OperationalFrom: PropTypes.string,
        OperationalTo: PropTypes.string,
        Status: PropTypes.string,
        LastUpdatedAt: PropTypes.string,
    })).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ReactorModal;