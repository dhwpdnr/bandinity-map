"use client";

import { useMemo, useState } from "react";

interface VenueRegionFieldProps {
  options: string[];
  initialRegion?: string;
  fieldClass: string;
}

const CUSTOM_REGION_VALUE = "__custom_region__";

export function VenueRegionField({
  options,
  initialRegion,
  fieldClass,
}: VenueRegionFieldProps) {
  const resolvedOptions = useMemo(
    () => Array.from(new Set(options.filter(Boolean))),
    [options]
  );
  const hasInitialRegion = initialRegion
    ? resolvedOptions.includes(initialRegion)
    : false;
  const [selectedRegion, setSelectedRegion] = useState(
    hasInitialRegion ? initialRegion : CUSTOM_REGION_VALUE
  );
  const [customRegion, setCustomRegion] = useState(
    hasInitialRegion ? "" : initialRegion ?? ""
  );

  return (
    <div className="space-y-2">
      <select
        name={selectedRegion === CUSTOM_REGION_VALUE ? undefined : "region"}
        required={selectedRegion !== CUSTOM_REGION_VALUE}
        value={selectedRegion}
        onChange={(event) => setSelectedRegion(event.target.value)}
        className={fieldClass}
      >
        {resolvedOptions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
        <option value={CUSTOM_REGION_VALUE}>새 지역 직접 입력</option>
      </select>

      {selectedRegion === CUSTOM_REGION_VALUE && (
        <input
          name="region"
          required
          value={customRegion}
          onChange={(event) => setCustomRegion(event.target.value)}
          placeholder="새 지역명을 입력해 주세요"
          className={fieldClass}
        />
      )}
    </div>
  );
}
