import { usePatient, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { assessValue, exist } from '../loadPatientTestData/helpers';

export const getName = (prefix, name) => {
  return prefix ? `${prefix}-${name}` : name;
};

const augmentObstreeData = (node, prefix) => {
  const outData = JSON.parse(JSON.stringify(node));
  outData.flatName = getName(prefix, node.display);
  outData.hasData = false;

  if (outData?.subSets?.length) {
    outData.subSets = outData.subSets.map((subNode) => augmentObstreeData(subNode, getName(prefix, node?.display)));
    outData.hasData = outData.subSets.some((subNode) => subNode.hasData);
  }
  if (exist(outData?.hiNormal, outData?.lowNormal)) {
    outData.range = `${outData.lowNormal} – ${outData.hiNormal}`;
  }
  if (outData?.obs?.length) {
    const assess = assessValue(outData);
    outData.obs = outData.obs.map((ob) => ({ ...ob, interpretation: assess(ob.value) }));
    outData.hasData = true;
  }

  return { ...outData };
};

const useGetObstreeData = (conceptUuid) => {
  const { patientUuid } = usePatient();
  const response = useSWR(`/ws/rest/v1/obstree?patient=${patientUuid}&concept=${conceptUuid}`, openmrsFetch);
  const result = useMemo(() => {
    if (response.data) {
      const { data, ...rest } = response;
      const newData = augmentObstreeData(data?.data, '');
      return { ...rest, loading: false, data: newData };
    } else {
      return {
        data: {},
        error: false,
        loading: true,
      };
    }
  }, [response]);
  return result;
};

const useGetManyObstreeData = (uuidArray) => {
  const { patientUuid } = usePatient();
  const getObstreeUrl = (index) => {
    if (index < uuidArray.length && patientUuid) {
      return `/ws/rest/v1/obstree?patient=${patientUuid}&concept=${uuidArray[index]}`;
    } else return null;
  };
  const { data } = useSWRInfinite(getObstreeUrl, openmrsFetch, { initialSize: uuidArray.length });

  const result = useMemo(() => {
    return (
      data?.map((resp) => {
        if (resp?.data) {
          const { data, ...rest } = resp;
          const newData = augmentObstreeData(data, '');
          return { ...rest, loading: false, data: newData };
        } else {
          return {
            data: {},
            error: false,
            loading: true,
          };
        }
      }) || [
        {
          data: {},
          error: false,
          loading: true,
        },
      ]
    );
  }, [data]);
  const roots = result.map((item) => item.data);
  const loading = result.some((item) => item.loading);
  const errors = result.filter((item) => item.error)?.map((item) => item.error) || [];

  return { roots, loading, errors };
};

export default useGetManyObstreeData;
export { useGetManyObstreeData, useGetObstreeData };
