"use client";
import React, { useState, useEffect } from 'react';
import Dropdown from './FilterDropdown';
import SplitDropdown from './SplitDropdown';
import SortDropdown from './SortDropdown';
import ViewToggle from './ViewToggle';
import ImageList from './ImageList';
import ImageGrid from './ImageGrid';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../../utils/auth';
import PreProcessModal from './PreProcessModal';
import SplitDataSetModal from './SplitDataSetModal';
import CreateModelModal from './CreateModelModal'
import PredictModal from './PredictModal';
import PredictResponseModal from './PredictResponseModal';
import { fetchAllModel } from '@/redux/allModelSlice';
import ModelMetricsPage from './ModelMetricsPage';
import { useMemo } from "react";
import {setSplitImageCategory} from '@/redux/splitImageCategorySlice'
import MaxAnnotation from './MaxAnnotation'

export default function ImageFilter({ projectId, subprojectId }) {
    const token = getToken()
    const [selectedItems, setSelectedItems] = useState([]);
    const [SortOption, setSortOption] = useState('Newest');
    const [AllSelectValue, setAllSelectValue] = useState(false);
    const [isSplitDataSet, setIsSplitDataSet] = useState(false);
    const [view, setView] = useState('grid');
    const user = useSelector((state) => state.user.userInfo);
    const splitValue = useSelector((state) => state.imageCategory.splitImageCategory)
    const searchQuery = useSelector((state) => state.search.searchQuery);
    const images = useSelector((state) => state.image.selectedImage);
    console.log(images)
    const [laveling, setLabling] = useState(false);
    const [iscreateModel, SetIsCreateModel] = useState(true);
    const [isPredict, SetIsPredict] = useState(false);
    const [predictResponse, setPredictResponse] = useState(false);
    const splitDataset = useSelector((state) => state.splitDataset.splitData);
    const modelData = useSelector((state) => state.modelData.modeldata);
    const predictImage = useSelector((state) => state.predictImage.predictImage);
    const model_list = useSelector((state) => state.allModel.allModel);
    const [is_max_annotation, setIs_max_annotation] = useState(false)
    const [modelList, setModelList] = useState(false);
    const dispatch = useDispatch()
    
    useEffect(() => {
        dispatch(setSplitImageCategory("all"))
      }, [subprojectId , dispatch]);


      const filteredImages = useMemo(() => {
        return images.filter((image) => {
          const matchesCategory = splitValue === "all" || image.category === splitValue;
          const matchesSearchQuery =
            !searchQuery ||
            image.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.label?.toLowerCase().includes(searchQuery.toLowerCase());
      
          // Filter based on annotation fieldName and value, with null checks
          const matchesAnnotations = !searchQuery || image.annotations?.some((annotation) => {
            return (
              annotation.fieldName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              annotation.value?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          });
      
          return matchesCategory && (matchesSearchQuery || matchesAnnotations);
        });
      }, [images, splitValue, searchQuery]);
      

    const handleCloseDetails = () => {
        setLabling(false);
    };

    const handleCLoseSplitModal = () => {
        setIsSplitDataSet(false)
    }
    const handleCLoseCreateModel = () => {
        SetIsCreateModel(false)
    }

    const handleCLosePredictModal = () => {
        SetIsPredict(false)
    }

    const handleCLosePredictResponseModal = () => {
        setPredictResponse(false)
    }

    const handleCLoseModelList = () => {
        setModelList(false)
    }

    const handleCloseMaxAnnotation = () => {
        setIs_max_annotation(!is_max_annotation)
    }

    useEffect(() => {
        if (subprojectId) {
            dispatch(fetchAllModel({ projectId, subprojectId, token }))
        }
    }, [subprojectId, token, projectId, dispatch]);


    return (
        <>
            <div className="w-full pb-3 flex justify-between items-center z-0 ">
                <div className="flex space-x-3 items-center text-sm">
                    {
                        subprojectId  && <SplitDropdown />
                    }
                    {/* <Dropdown selectedItems={selectedItems} setSelectedItems={setSelectedItems} /> */}
                    {/* <SortDropdown sortOption={SortOption} setSortOption={setSortOption} /> */}
                    {
                        projectId && <div className="" >
                            <button onClick={() => setIs_max_annotation(true)} className='px-2 py-1 bg-primary text-white rounded-md items-center flex'>Max Annotation Number</button>
                        </div>
                    }
                    {
                        projectId && <div className="" >
                            <button onClick={() => setLabling(true)} className='px-2 py-1 bg-primary text-white rounded-md'>Pre Processiong</button>
                        </div>
                    }
                    {
                        subprojectId && <div className="" >
                            <button onClick={() => setIsSplitDataSet(true)} className='px-2 py-1 bg-primary text-white rounded-md text-sm'>Split</button>
                        </div>
                    }
                    {
                        splitDataset && <div className="" >
                            <button onClick={() => SetIsCreateModel(true)} className='px-2 py-1 bg-primary text-white rounded-md text-sm'>Create Model</button>
                        </div>
                    }
                    {
                        subprojectId && model_list && model_list.length > 0  && <div className="" >
                            <button onClick={() => SetIsPredict(true)} className='px-2 py-1 bg-primary text-white rounded-md text-sm'>Predict</button>
                        </div>
                    }
                    {
                        predictImage  && <div className="" >
                            <button onClick={() => setPredictResponse(true)} className='px-2 py-1 bg-primary text-white rounded-md text-sm'> Image Response </button>
                        </div>
                    }
                    {
                        model_list && model_list.length > 0  && <div className="" >
                            <button onClick={() => setModelList(true)} className='px-2 py-1 bg-primary text-white rounded-md text-sm'>Model List</button>
                        </div>
                    }

                </div>
                <div className="flex space-x-3 ">
                    <ViewToggle view={view} setView={setView} />
                </div>
            </div>
            {
                view === 'grid' ? <ImageGrid projectId={projectId} subprojectId={subprojectId} images={filteredImages} token={token} AllSelectValue={AllSelectValue} /> : <ImageList projectId={projectId} subprojectId={subprojectId} images={images} token={token} />
            }
            {
                laveling && projectId && <PreProcessModal
                    projectId={projectId}
                    subprojectId={subprojectId}
                    onClose={handleCloseDetails}
                    token={token}
                />
            }
            {
                 is_max_annotation && <MaxAnnotation projectId={projectId} subprojectId={subprojectId} onClose={handleCloseMaxAnnotation} token={token} />
            }
            {
                isSplitDataSet && subprojectId && <SplitDataSetModal projectId={projectId} subprojectId={subprojectId} onClose={handleCLoseSplitModal} token={token} />
            }
            {
                splitDataset && iscreateModel && <CreateModelModal splitDataset={splitDataset} projectId={projectId} subprojectId={subprojectId} onClose={handleCLoseCreateModel} token={token} />
            }
            {
                isPredict && <PredictModal projectId={projectId} subprojectId={subprojectId} token={token} onClose={handleCLosePredictModal} />
            }
            {
                predictResponse && <PredictResponseModal predictImage={predictImage} projectId={projectId} subprojectId={subprojectId} token={token} onClose={handleCLosePredictResponseModal} />
            }
            {
                modelList && < ModelMetricsPage modelsArray={model_list} onClose={handleCLoseModelList} />
            }

        </>
    );
}
