import React from "react";
import { SingleClient } from "../view-edit-client/view-client.component";
import { useCss, always } from "kremling";
import { useDropzone } from "react-dropzone";
import pictureUrl from "../../icons/148705-essential-collection/svg/picture.svg";
import easyFetch from "../util/easy-fetch";
import { entries } from "lodash-es";
import ReportIssue from "../report-issue/report-issue.component";

export default function ClientFiles(props: ClientFilesProps) {
  if (!localStorage.getItem("client-files")) {
    return (
      <ReportIssue missingFeature hideHeader title="Client file storage" />
    );
  }

  const scope = useCss(css);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [filesToUpload, setFilesToUpload] = React.useState(null);

  React.useEffect(() => {
    if (filesToUpload) {
      const abortController = new AbortController();

      easyFetch(
        `/api/file-upload-urls?file=${filesToUpload
          .map((f) => f.name)
          .join("&file=")}`,
        {
          signal: abortController.signal,
        }
      ).then((data) => {
        const formData = new FormData();

        entries(data.presignedPost.fields).forEach(([key, value]) => {
          // @ts-ignore
          formData.append(key, value);
        });

        filesToUpload.forEach((file) => {
          formData.append("file", file);
        });

        const fileName = filesToUpload[0].name;
        const extensionSplit = fileName.split(".");
        const fileExtension =
          extensionSplit.length > 1
            ? extensionSplit[extensionSplit.length - 1]
            : "";
        const fileSize = filesToUpload[0].size;

        return easyFetch(data.presignedPost.url, {
          method: "POST",
          signal: abortController.signal,
          body: formData,
        }).then(() =>
          easyFetch(`/api/clients/${props.clientId}/files`, {
            signal: abortController.signal,
            method: "POST",
            body: {
              s3Key: data.presignedPost.fields.key,
              fileName,
              fileExtension,
              fileSize,
            },
          })
        );
      });

      return () => {
        abortController.abort();
      };
    }
  }, [filesToUpload]);

  return (
    <div className="card" {...scope}>
      <h1>Client files</h1>
      <div
        {...getRootProps({
          className: always("dropzone").maybe("active", isDragActive),
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="active-drop">
            <img src={pictureUrl} />
            <div>Drop file</div>
          </div>
        ) : (
          "Drop files or click to add"
        )}
      </div>
    </div>
  );

  function onDrop(acceptedFiles) {
    setFilesToUpload(acceptedFiles);
  }
}

const css = `
& h1 {
  font-size: 2.1rem;
}

& .dropzone {
  border: .1rem dashed var(--very-dark-gray);
  background-color: var(--light-gray);
  min-height: 14rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

& .dropzone img {
  height: 6rem;
}

& .active-drop {
  text-align: center;
}
`;

type ClientFilesProps = {
  path: string;
  clientId: string;
  client: SingleClient;
  navigate?: (path) => any;
};
