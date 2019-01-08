<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="'账号'" v-model="listQuery.account" clearable style="width: 160px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-input :placeholder="'姓名'" v-model="listQuery.name" clearable style="width: 160px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.status" :placeholder="'状态'" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select>
      <el-select v-model="listQuery.is_open_cloud_ctrl" :placeholder="'云控'" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in is_open_cloud_ctrlOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-delete" @click="handleMultipleDelete">删除</el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-view" @click="handleShowJS">已购脚本</el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button> -->
    </div>

    <el-table
      v-loading="listLoading"
      ref="userTable"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange">
      @sort-change="sortChange">
      <el-table-column
        type="selection"
        prop="checkbox"
        width="55"/>
      <el-table-column :label="'序号'" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'账号'" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'用户'" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'昵称'" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'密码'" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'状态'" class-name="status-col" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status | statusTextFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="'创建时间'" width="180px" align="center" prop="created_at" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'过期时间'" width="180px" align="center" prop="expire_in" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.expire_in }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'操作'" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNumber" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="'昵称'" prop="nickname">
          <el-input v-model="temp.nickname"/>
        </el-form-item>
        <el-form-item :label="'状态'">
          <el-switch v-model="temp.status"/>
        </el-form-item>
        <el-form-item :label="'云控'">
          <el-switch v-model="temp.is_open_cloud_ctrl"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogJSVisible">
      <el-table
        v-loading="listLoading"
        :key="tableKey"
        :data="jslist"
        border
        fit
        highlight-current-row
        style="width: 100%;">
        <el-table-column :label="'序号'" align="center" width="80">
          <template slot-scope="scope">
            <span>{{ scope.$index+1 }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="'平台'" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="'是否启用'" align="center" width="120" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.is_display"/>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" @click="handleSaveJS()">保存</el-button>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, addUser, updateUser, fetchUser, delUser, delUsers, myjs, savejs } from '@/api/article'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    },
    statusTextFilter(status) {
      const statusMap = {
        1: '正常',
        0: '异常'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      jslist: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNumber: 1,
        pageSize: 20,
        sort: ''
      },
      statusOptions: [{ label: '异常', key: 0 }, { label: '正常', key: 1 }],
      is_open_cloud_ctrlOptions: [{ label: '关闭', key: 0 }, { label: '开启', key: 1 }],
      showReviewer: false,
      temp: {
        nickname: ''
      },
      dialogFormVisible: false,
      dialogJSVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        // nickname: [{ required: true, message: '昵称不能为空', trigger: 'change' }]
      },
      downloadLoading: false,
      multipleSelection: []
    }
  },
  created() {
    this.listQuery.pageNumber = 1
    this.getList()
  },
  methods: {
    handleRowClick(row) {
      this.$refs.userTable.clearSelection()
      this.$refs.userTable.toggleRowSelection(row)
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.totalRow

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.2 * 1000)
      })
    },
    handleFilter() {
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      } else if (prop === 'created_at') {
        this.sortByCreatedAt(order)
      } else if (prop === 'expire_in') {
        this.sortExpireIn(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    sortByCreatedAt(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'created_at asc'
      } else {
        this.listQuery.sort = 'created_at desc'
      }
      this.handleFilter()
    },
    sortExpireIn(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'expire_in asc'
      } else {
        this.listQuery.sort = 'expire_in desc'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        nickname: '昵称',
        status: true,
        is_open_cloud_ctrl: true
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.status = this.temp.status ? 1 : 0
          this.temp.is_open_cloud_ctrl = this.temp.is_open_cloud_ctrl ? 1 : 0
          addUser(this.temp).then(() => {
            // this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      // this.temp = Object.assign({}, row) // copy obj
      fetchUser(row.id).then((user) => {
        this.temp = {
          id: row.id,
          nickname: user.data.nickname,
          status: user.data.status === 1,
          is_open_cloud_ctrl: user.data.is_open_cloud_ctrl === 1
        }
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.status = tempData.status ? 1 : 0
          tempData.is_open_cloud_ctrl = tempData.is_open_cloud_ctrl ? 1 : 0
          updateUser(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delUser(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleMultipleDelete(row) {
      this.$confirm('是否确认删除所选数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var ids = ''
        for (var i = 0; i < this.multipleSelection.length; i++) {
          ids += this.multipleSelection[i].id + ','
        }
        ids = ids.substr(0, ids.length - 1)
        delUsers(ids).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleShowJS() {
      if (this.multipleSelection.length !== 1) {
        this.$message({
          type: 'info',
          message: '请选中一条数据'
        })
        return
      }
      this.dialogJSVisible = true
      myjs(this.multipleSelection[0].id).then((response) => {
        this.jslist = response.data
      })
    },
    handleSaveJS() {
      var json = JSON.stringify(this.jslist)
      savejs(json).then((response) => {
        this.dialogJSVisible = false
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
