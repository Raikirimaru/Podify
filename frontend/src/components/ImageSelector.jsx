import React from 'react';
import styled from 'styled-components';
import ReactImageFileToBase64 from "react-file-image-to-base64";
import { CloudUploadTwoTone } from '@mui/icons-material';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next'


const Container = styled.div`
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    align-items: center;
    border: 2px dashed ${({ theme }) => theme.text_primary + "80"};
    border-radius: 12px;
    color: ${({ theme }) => theme.text_primary + "80"};
    margin: 30px 20px 0px 20px;
`;

const Typo = styled.div`
    font-size: 14px;
    font-weight: 600;
`;

const TextBtn = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.primary};
    cursor: pointer;
`;

const Img = styled.img`
    height: 120px !important;
    width: 100%;
    object-fit: cover;
    border-radius: 12px;
`;

export const ImageSelector = ({ podcast, setPodcast }) => {
    const { t } = useTranslation();

    const handleOnCompleted = files => {
        if (files && files.length > 0) {
            const file = files[0];
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/jfif'];
            const maxSize = 10 * 1024 * 1024;

            if (!allowedTypes.includes(file.file_type)) {
                toast.error(t('imgSelector.invalidFileType'));
                return;
            }

            if (parseInt(file.file_size.replace(' KB', '')) * 1024 > maxSize) {
                toast.error(t('imgSelector.fileSizeExceedsLimit'));
                return;
            }

            setPodcast(prev => ({
                ...prev,
                thumbnail: file.base64_file || "",
            }));
        }
    };

    const CustomisedButton = ({ triggerInput } = {}) => {
        return (
            <TextBtn onClick={triggerInput}>
                {t('imgSelector.browseImage')}
            </TextBtn>
        );
    };

    return (
        <Container>
            {podcast?.thumbnail ? (
                <Img src={podcast.thumbnail} alt="Podcast Thumbnail" />
            ) : (
                <>
                    <CloudUploadTwoTone sx={{ fontSize: "40px" }} />
                    <Typo>{t('imgSelector.clickHereToUpload')}</Typo>
                    <div style={{ display: "flex", gap: '6px' }}>
                        <Typo>{t('imgSelector.or')}</Typo>
                        <ReactImageFileToBase64
                            onCompleted={handleOnCompleted}
                            CustomisedButton={CustomisedButton}
                            multiple={false}
                        />
                    </div>
                </>
            )}
        </Container>
    );
};