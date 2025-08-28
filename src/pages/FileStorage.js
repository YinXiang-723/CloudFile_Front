import React, { useState, useEffect } from 'react';
import {
  Layout,
  Upload,
  Card,
  Row,
  Col,
  Button,
  Modal,
  message,
  Checkbox,
  Tooltip,
  Tree,
  Table,
  Space
} from 'antd';
import {
  InboxOutlined,
  FolderOutlined,
  FileOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  FolderOpenOutlined,
  CloudUploadOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserImages, uploadImage, deleteImage } from '../services/images';
import { API_CONFIG } from '../config';

const { Dragger } = Upload;
const { Content } = Layout;
const { DirectoryTree } = Tree;
const { confirm } = Modal;

const StyledLayout = styled(Layout)`
  background: linear-gradient(135deg, rgba(200, 255, 200, 0.4), rgba(150, 255, 150, 0.2));
  min-height: 100vh;
  padding: 24px;
`;

const StyledContent = styled(Content)`
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
`;

const UploadArea = styled(Card)`
  margin-bottom: 24px;
  .ant-upload-drag {
    background: rgba(255, 255, 255, 0.5);
    border: 2px dashed rgba(26, 93, 26, 0.3);
    border-radius: 8px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const FolderTreePanel = styled(Card)`
  width: 250px;
  margin-right: 16px;
  overflow-y: auto;
  .ant-card-body {
    padding: 8px;
  }
`;

const FileListPanel = styled(Card)`
  flex: 1;
  overflow-y: auto;
  .ant-card-body {
    padding: 16px;
  }
`;

const FileTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: rgba(26, 93, 26, 0.1);
    color: #1a5d1a;
    font-weight: 600;
  }
`;

const FileStorage = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [folderTree, setFolderTree] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 获取文件列表
  const fetchFiles = async () => {
    if (!user || !user.token) return;

    setLoading(true);
    try {
      const response = await fetchUserImages(user);
      setFiles(response);
    } catch (error) {
      console.error('获取文件列表错误：', error);
      message.error('获取文件列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 获取文件夹树
  const fetchFolderTree = async () => {
    if (!user || !user.token) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOLDERS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ username: user.username })
      });

      const data = await response.json();
      if (data.code === 0) {
        setFolderTree(data.data || []);
      }
    } catch (error) {
      console.error('获取文件夹树错误：', error);
    }
  };

  // 处理文件上传
  const handleUpload = async (file) => {
    if (!user || !user.token) {
      message.error('请先登录');
      return;
    }

    setUploading(true);
    try {
      await uploadImage(file, user);
      message.success('上传成功！');
      fetchFiles();
      fetchFolderTree();
    } catch (error) {
      console.error('上传错误：', error);
      message.error('上传失败！');
    } finally {
      setUploading(false);
    }

    return false; // 阻止自动上传
  };

  // 处理文件删除
  const handleDelete = async (file) => {
    confirm({
      title: '确认删除',
      content: `确定要删除文件 "${file.name}" 吗？`,
      onOk: async () => {
        try {
          await deleteImage(file, user);
          message.success('删除成功！');
          fetchFiles();
          fetchFolderTree();
        } catch (error) {
          console.error('删除错误：', error);
          message.error('删除失败！');
        }
      }
    });
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的文件');
      return;
    }

    confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个文件吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BATCH_OPERATION}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              cmd: 'delete',
              fileIds: selectedRowKeys,
              username: user.username
            })
          });

          const data = await response.json();
          if (data.code === 0) {
            message.success('批量删除成功！');
            setSelectedRowKeys([]);
            fetchFiles();
            fetchFolderTree();
          } else {
            message.error(data.msg || '批量删除失败');
          }
        } catch (error) {
          console.error('批量删除错误：', error);
          message.error('批量删除失败！');
        }
      }
    });
  };

  // 处理文件移动
  const handleMoveFile = async (file, targetFolderId) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_MOVE}?cmd=single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fileId: file.id,
          targetFolderId,
          username: user.username
        })
      });

      const data = await response.json();
      if (data.code === 0) {
        message.success('移动成功！');
        fetchFiles();
        fetchFolderTree();
      } else {
        message.error(data.msg || '移动失败');
      }
    } catch (error) {
      console.error('移动错误：', error);
      message.error('移动失败！');
    }
  };

  // 处理批量移动
  const handleBatchMove = (folderId) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要移动的文件');
      return;
    }

    confirm({
      title: '确认移动',
      content: `确定要将选中的 ${selectedRowKeys.length} 个文件移动到该文件夹吗？`,
      onOk: async () => {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BATCH_OPERATION}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              cmd: 'move',
              fileIds: selectedRowKeys,
              targetFolderId: folderId,
              username: user.username
            })
          });

          const data = await response.json();
          if (data.code === 0) {
            message.success('批量移动成功！');
            setSelectedRowKeys([]);
            fetchFiles();
            fetchFolderTree();
          } else {
            message.error(data.msg || '批量移动失败');
          }
        } catch (error) {
          console.error('批量移动错误：', error);
          message.error('批量移动失败！');
        }
      }
    });
  };

  // 处理文件分享
  const handleShare = async (file) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHARE_FILES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fileId: file.id,
          username: user.username
        })
      });

      const data = await response.json();
      if (data.code === 0) {
        message.success('分享成功！链接已复制到剪贴板');
      } else {
        message.error(data.msg || '分享失败');
      }
    } catch (error) {
      console.error('分享错误：', error);
      message.error('分享失败！');
    }
  };

  // 处理批量分享
  const handleBatchShare = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要分享的文件');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BATCH_OPERATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          cmd: 'share',
          fileIds: selectedRowKeys,
          username: user.username
        })
      });

      const data = await response.json();
      if (data.code === 0) {
        message.success('批量分享成功！');
        setSelectedRowKeys([]);
      } else {
        message.error(data.msg || '批量分享失败');
      }
    } catch (error) {
      console.error('批量分享错误：', error);
      message.error('批量分享失败！');
    }
  };

  // 文件下载
  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url || `${API_CONFIG.STORAGE_URL}/${file.path}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 表格列配置
  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FileOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size) => size || '未知',
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time) => time || '未知',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="下载">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 初始化数据
  useEffect(() => {
    if (user && user.token) {
      fetchFiles();
      fetchFolderTree();
    }
  }, [user]);

  // 选择文件变化
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <StyledLayout>
      <StyledContent>
        {/* 上传区域 */}
        <UploadArea title="文件上传">
          <Dragger
            accept="*"
            showUploadList={false}
            beforeUpload={handleUpload}
            disabled={!user || !user.token}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持任意格式文件，单个或批量上传
            </p>
          </Dragger>
        </UploadArea>

        {/* 主内容区 */}
        <MainContent>
          {/* 文件夹树 */}
          <FolderTreePanel title="文件夹">
            <DirectoryTree
              treeData={folderTree}
              defaultExpandAll
              onSelect={(keys, info) => {
                setCurrentFolder(keys[0]);
              }}
            />
          </FolderTreePanel>

          {/* 文件列表 */}
          <FileListPanel title="文件列表">
            {/* 批量操作栏 */}
            {selectedRowKeys.length > 0 && (
              <div style={{ marginBottom: 16, padding: 8, background: '#f0f9eb', borderRadius: 4 }}>
                <Space>
                  <span>已选择 {selectedRowKeys.length} 项</span>
                  <Button type="primary" icon={<DownloadOutlined />} onClick={() => {
                    selectedRowKeys.forEach(fileId => {
                      const file = files.find(f => f.id === fileId);
                      if (file) handleDownload(file);
                    });
                  }}>
                    批量下载
                  </Button>
                  <Button icon={<ShareAltOutlined />} onClick={handleBatchShare}>
                    批量分享
                  </Button>
                  <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
                    批量删除
                  </Button>
                  <Button icon={<FolderOpenOutlined />} onClick={() => {
                    confirm({
                      title: '移动文件',
                      content: '请选择目标文件夹',
                      okText: '确定',
                      cancelText: '取消',
                      onOk: () => {
                        // 这里可以添加文件夹选择逻辑
                        handleBatchMove('target-folder-id');
                      }
                    });
                  }}>
                    批量移动
                  </Button>
                  <Button onClick={() => setSelectedRowKeys([])}>
                    取消选择
                  </Button>
                </Space>
              </div>
            )}

            {/* 文件表格 */}
            <FileTable
              rowKey="id"
              columns={columns}
              dataSource={files}
              rowSelection={rowSelection}
              loading={loading}
              pagination={false}
              size="middle"
              scroll={{ y: 'calc(100vh - 300px)' }}
            />
          </FileListPanel>
        </MainContent>
      </StyledContent>
    </StyledLayout>
  );
};

export default FileStorage;